# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V1::InviteToResponseController, type: :controller do
  describe '#record_response' do
    let(:token) { 'secure.jwt.token' }
    let(:deadline) { '2099-01-01' }
    let(:application_id) { 'a0o123' }
    let(:act) { 'submit' }

    let(:decoded_token) do
      {
        'type' => 'I2A',
        'deadline' => deadline,
        'appId' => application_id,
        'act' => act,
      }
    end

    let(:valid_record_params) do
      {
        listingId: 'listing-id',
        action: 'submit',
      }
    end

    before do
      allow(JsonWebTokenService).to receive(:decode_token).with(token).and_return(decoded_token)
      allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
    end

    it 'records using signed token claims' do
      post :record_response, params: {
        t: token,
        record: valid_record_params,
      }

      expect(response).to have_http_status(:ok)
      expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response).with(
        deadline,
        application_id,
        application_id,
        'submit',
        'submit',
        'listing-id',
      )
    end

    it 'returns unauthorized for invalid token' do
      allow(JsonWebTokenService).to receive(:decode_token).with(token)
        .and_raise(JsonWebTokenService::InvalidTokenError, 'Invalid JWT')

      post :record_response, params: {
        t: token,
        record: valid_record_params,
      }

      expect(response).to have_http_status(:unauthorized)
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end

    it 'returns unauthorized when required token fields are missing' do
      allow(JsonWebTokenService).to receive(:decode_token).with(token).and_return(
        decoded_token.merge('act' => nil),
      )

      post :record_response, params: {
        t: token,
        record: valid_record_params,
      }

      expect(response).to have_http_status(:unauthorized)
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end

    it 'returns unauthorized when token deadline is invalid' do
      allow(JsonWebTokenService).to receive(:decode_token).with(token).and_return(
        decoded_token.merge('deadline' => 'not-a-date'),
      )

      post :record_response, params: {
        t: token,
        record: valid_record_params,
      }

      expect(response).to have_http_status(:unauthorized)
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end

    it 'does not record for expired deadline and still returns ok' do
      allow(JsonWebTokenService).to receive(:decode_token).with(token).and_return(
        decoded_token.merge('deadline' => '1999-01-01'),
      )

      post :record_response, params: {
        t: token,
        record: valid_record_params,
      }

      expect(response).to have_http_status(:ok)
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end

    it 'returns unauthorized when required record params are missing' do
      post :record_response, params: {
        t: token,
        record: { action: 'submit' }, # missing listingId
      }

      expect(response).to have_http_status(:unauthorized)
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end

    # context 'with real JWT encode/decode round-trip' do
    #   let(:roundtrip_deadline) { 2.days.from_now.to_date.to_s }
    #   let(:roundtrip_app_id) { 'app-from-signed-token' }
    #   let(:roundtrip_app_number) { 'APP-ROUNDTRIP-123' }
    #   let(:roundtrip_listing_id) { 'listing-from-signed-token' }
    #   let(:roundtrip_token_payload) do
    #     {
    #       type: 'I2A',
    #       deadline: roundtrip_deadline,
    #       appId: roundtrip_app_id,
    #       applicationNumber: roundtrip_app_number,
    #       listingId: roundtrip_listing_id,
    #     }
    #   end
    #   let(:roundtrip_token) { JsonWebTokenService.encode_token(roundtrip_token_payload) }

    #   before do
    #     stub_const('JsonWebTokenService::SECRET_KEY', 'test_secret')
    #     stub_const('JsonWebTokenService::ALGORITHM', 'HS256')
    #     stub_const('JsonWebTokenService::ALLOWED_ALGORITHMS', ['HS256'])
    #     allow(JsonWebTokenService).to receive(:decode_token).and_call_original
    #     allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
    #   end

    #   it 'uses signed claims and ignores tampered body identifiers' do
    #     post :record_response, params: {
    #       t: roundtrip_token,
    #       record: {
    #         response: 'yes',
    #         action: 'submit',
    #         appId: 'TAMPERED',
    #         applicationNumber: 'TAMPERED',
    #         listingId: 'TAMPERED',
    #       },
    #     }

    #     expect(response).to have_http_status(:ok)
    #     expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response).with(
    #       roundtrip_deadline,
    #       roundtrip_app_id,
    #       roundtrip_app_number,
    #       'yes',
    #       'submit',
    #       roundtrip_listing_id,
    #     )
    #   end

    #   it 'returns unauthorized when token is missing' do
    #     post :record_response, params: {
    #       record: { response: 'yes', action: 'submit' },
    #     }

    #     expect(response).to have_http_status(:unauthorized)
    #     expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    #   end
    # end
  end

  describe '#log_human_verified' do
    let(:deadline) { '2099-01-01' }
    let(:application_id) { 'a0o123' }
    let(:listing_id) { 'listing-id' }

    let(:valid_record) do
      {
        type: 'I2A',
        deadline: deadline,
        appId: application_id,
        listingId: listing_id,
        act: 'yes',
        trigger: 'interaction',
        elapsedMs: 1234,
        env: { webdriver: false, ua: 'Mozilla/5.0 FBAN/FBIOS', coarse: true },
      }
    end

    before do
      allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
      allow(Rails.logger).to receive(:info)
    end

    it 'logs the human-verified click as a structured shadow event and records nothing' do
      post :log_human_verified, params: { record: valid_record }

      expect(response).to be_ok
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      expect(Rails.logger).to have_received(:info).with(
        a_string_including(
          'invite_to.response',
          '"event":"invite_to.response"',
          '"outcome":"suppressed"',
          '"source":"client_shadow"',
          '"reason":"shadow_human_verified"',
          '"app_id":"a0o123"',
          '"act":"yes"',
          '"trigger":"interaction"',
        ),
      )
    end

    # Note: ActionController::Parameters stringifies scalars, so env booleans serialize as
    # "false"/"true" rather than JSON booleans. Harmless for querying, but assert what we emit.
    it 'includes the passive browser env snapshot for post-hoc classification' do
      post :log_human_verified, params: { record: valid_record }

      expect(Rails.logger).to have_received(:info).with(
        a_string_including('"env":', '"ua":"Mozilla/5.0 FBAN/FBIOS"', '"webdriver":"false"'),
      )
    end

    it 'drops unknown env keys, nested values, and over-long values' do
      logged = []
      allow(Rails.logger).to receive(:info) { |msg| logged << msg.to_s }

      post :log_human_verified, params: {
        record: valid_record.merge(
          env: {
            ua: 'a' * 400,
            webdriver: false,
            evil: 'should-not-be-logged',
            nested: { deep: 'no' },
          },
        ),
      }

      expect(response).to be_ok
      # Scope to our structured event: Rails' own "Parameters:" line echoes the raw
      # request body, which the sanitizer does not (and cannot) control.
      event = logged.find { |msg| msg.start_with?('invite_to.response ') }
      expect(event).to include('"webdriver":"false"')
      expect(event).not_to include('should-not-be-logged')
      expect(event).not_to include('"evil"')
      expect(event).not_to include('a' * 300)
    end

    it 'omits env entirely when no recognized keys are supplied' do
      post :log_human_verified, params: {
        record: valid_record.merge(env: { evil: 'nope' }),
      }

      expect(response).to be_ok
      expect(Rails.logger).not_to have_received(:info).with(a_string_including('"env":'))
    end

    it 'returns 400 when the record param is missing' do
      post :log_human_verified, params: { notRecord: {} }
      expect(response).to have_http_status(:bad_request)
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end

    it 'returns 500 on an unexpected error' do
      allow(Rails.logger).to receive(:info).and_raise(StandardError, 'boom')
      post :log_human_verified, params: { record: valid_record }
      expect(response).to have_http_status(:internal_server_error)
    end
  end
end
