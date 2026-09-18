# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JsonWebTokenService do

  before do
    stub_const('JsonWebTokenService::SECRET_KEY', 'test_secret')
    stub_const('JsonWebTokenService::ALGORITHM', 'HS256')
    stub_const('JsonWebTokenService::ALLOWED_ALGORITHMS', ['HS256'])
  end

  describe '.encode_token' do
    it 'encodes payload under data key' do
      token = described_class.encode_token({ 'appId' => 'a0o123' })
      decoded = described_class.decode_token(token)

      expect(decoded).to include('appId' => 'a0o123')
    end

    it 'omits the exp claim when not given' do
      token = described_class.encode_token({ 'appId' => 'a0o123' })
      payload, = JWT.decode(token, described_class::SECRET_KEY, true,
                            algorithms: described_class::ALLOWED_ALGORITHMS)

      expect(payload).not_to have_key('exp')
    end

    it 'includes a top-level exp claim when given' do
      exp = 1.hour.from_now
      token = described_class.encode_token({ 'appId' => 'a0o123' }, exp:)
      payload, = JWT.decode(token, described_class::SECRET_KEY, true,
                            algorithms: described_class::ALLOWED_ALGORITHMS)

      expect(payload['exp']).to eq(exp.to_i)
      expect(described_class.decode_token(token)).to include('appId' => 'a0o123')
    end
  end

  describe '.decode_token' do
    it 'raises when token is blank' do
      expect { described_class.decode_token(nil) }
        .to raise_error(JsonWebTokenService::InvalidTokenError, 'Token is blank')
    end

    it 'raises when payload data is not a hash' do
      token = JWT.encode({ data: 'invalid' }, described_class::SECRET_KEY,
                         described_class::ALGORITHM)

      expect { described_class.decode_token(token) }
        .to raise_error(JsonWebTokenService::InvalidTokenError, 'Invalid JWT payload')
    end

    it 'raises InvalidTokenError on JWT decode failure' do
      allow(JWT).to receive(:decode).and_raise(JWT::DecodeError,
                                               'Signature verification failed')

      expect { described_class.decode_token('bad.token.value') }
        .to raise_error(JsonWebTokenService::InvalidTokenError,
                        'Invalid JWT: Signature verification failed')
    end

    it 'decodes with explicit allowed algorithms' do
      token = 'valid.token'
      allow(JWT).to receive(:decode).and_return([{ 'data' => { 'appId' => 'a0o123' } },
                                                 {}])

      described_class.decode_token(token)

      expect(JWT).to have_received(:decode).with(
        token,
        described_class::SECRET_KEY,
        true,
        hash_including(algorithms: described_class::ALLOWED_ALGORITHMS),
      )
    end

    context 'expiration handling' do
      let(:expired_token) do
        described_class.encode_token({ 'appId' => 'a0o123' }, exp: 1.hour.ago)
      end
      let(:live_token) do
        described_class.encode_token({ 'appId' => 'a0o123' }, exp: 1.hour.from_now)
      end

      it 'defaults to not verifying expiration, so an expired token still decodes' do
        expect(described_class.decode_token(expired_token)).to eq('appId' => 'a0o123')
      end

      it 'raises ExpiredTokenError for an expired token when verify_expiration: true' do
        expect { described_class.decode_token(expired_token, verify_expiration: true) }
          .to raise_error(JsonWebTokenService::ExpiredTokenError, 'Expired JWT')
      end

      it 'decodes normally for a live token when verify_expiration: true' do
        expect(described_class.decode_token(live_token, verify_expiration: true))
          .to eq('appId' => 'a0o123')
      end

      it 'ExpiredTokenError is a kind of InvalidTokenError' do
        expect(JsonWebTokenService::ExpiredTokenError.ancestors)
          .to include(JsonWebTokenService::InvalidTokenError)
      end
    end
  end
end
