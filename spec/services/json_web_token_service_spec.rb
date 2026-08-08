# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JsonWebTokenService do
  describe '.encode_token' do
    it 'encodes payload under data key' do
      token = described_class.encode_token({ 'appId' => 'a0o123' })
      decoded = described_class.decode_token(token)

      expect(decoded).to include('appId' => 'a0o123')
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
  end
end
