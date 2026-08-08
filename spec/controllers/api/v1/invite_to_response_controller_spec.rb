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
        deadline: 'TAMPERED-DEADLINE',
        appId: 'TAMPERED-APP-ID',
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
        act,
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

    it 'returns bad request when required record params are missing' do
      post :record_response, params: {
        t: token,
        record: { action: 'submit' }, # missing deadline + appId
      }

      expect(response).to have_http_status(:bad_request)
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end

    context 'with real JWT encode/decode round-trip' do
      let(:roundtrip_deadline) { 2.days.from_now.to_date.to_s }
      let(:roundtrip_app_id) { 'app-from-signed-token' }
      let(:roundtrip_app_number) { 'APP-ROUNDTRIP-123' }
      let(:roundtrip_listing_id) { 'listing-from-signed-token' }
      let(:roundtrip_token_payload) do
        {
          type: 'I2A',
          deadline: roundtrip_deadline,
          appId: roundtrip_app_id,
          applicationNumber: roundtrip_app_number,
          listingId: roundtrip_listing_id,
        }
      end
      let(:roundtrip_token) { JsonWebTokenService.encode_token(roundtrip_token_payload) }

      before do
        allow(JsonWebTokenService).to receive(:decode_token).and_call_original
        allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
      end

      it 'uses signed claims and ignores tampered body identifiers' do
        post :record_response, params: {
          t: roundtrip_token,
          record: {
            response: 'yes',
            action: 'submit',
            appId: 'TAMPERED',
            applicationNumber: 'TAMPERED',
            listingId: 'TAMPERED',
          },
        }

        expect(response).to have_http_status(:ok)
        expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response).with(
          roundtrip_deadline,
          roundtrip_app_id,
          roundtrip_app_number,
          'yes',
          'submit',
          roundtrip_listing_id,
        )
      end

      it 'returns unauthorized when token is missing' do
        post :record_response, params: {
          record: { response: 'yes', action: 'submit' },
        }

        expect(response).to have_http_status(:unauthorized)
        expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      end
    end
  end
end
