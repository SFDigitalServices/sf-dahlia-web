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
        application_id,
        'submit',
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

    # Given a signed token, or a posted action, that fails one of record-response's checks
    # When it is posted to record a response
    # Then it is rejected and nothing is forwarded to the backend
    {
      'a missing appId' => [{ 'appId' => nil }, 'submit'],
      'an unparseable deadline' => [{ 'deadline' => 'not-a-date' }, 'submit'],
      # Time.zone.parse raises here rather than returning nil: 401, not 500
      'a deadline that raises on parse' => [{ 'deadline' => '2024-13-45' }, 'submit'],
      'a type not minted for invite-to links' => [{ 'type' => 'hc_session' }, 'submit'],
      'an action the next-steps pages never send' => [{}, 'yes'],
      'a blank action' => [{}, ''],
      'an I2A token posting appointment' => [{ 'type' => 'I2A' }, 'appointment'],
      'an I2I token posting submit' => [{ 'type' => 'I2I' }, 'submit'],
    }.each do |scenario, (claim_overrides, action)|
      it "returns unauthorized and records nothing for #{scenario}" do
        allow(JsonWebTokenService).to receive(:decode_token).with(token).and_return(
          decoded_token.merge(claim_overrides),
        )

        post :record_response, params: { t: token, record: { action: action } }

        expect(response).to have_http_status(:unauthorized)
        expect(DahliaBackend::MessageService)
          .not_to have_received(:send_invite_to_response)
      end
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

    # Given a token minted for a test/preview invite link
    # When the client posts a response
    # Then nothing is recorded, matching the GET path's test_link suppression
    it 'does not record for a test link and still returns ok' do
      allow(JsonWebTokenService).to receive(:decode_token).with(token).and_return(
        decoded_token.merge('isTest' => true),
      )

      post :record_response, params: {
        t: token,
        record: valid_record_params,
      }

      expect(response).to have_http_status(:ok)
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end

    context 'with real signed tokens' do
      let(:page_claims) do
        { type: 'I2I', deadline: deadline, appId: application_id, isTest: false }
      end

      before do
        stub_const('JsonWebTokenService::SECRET_KEY', 'test_secret')
        stub_const('JsonWebTokenService::ALGORITHM', 'HS256')
        stub_const('JsonWebTokenService::ALLOWED_ALGORITHMS', ['HS256'])
        allow(JsonWebTokenService).to receive(:decode_token).and_call_original
      end

      # Given a next-steps page token, which InviteToController#index mints without `act`
      #   so loading the page cannot itself record a response
      # When the applicant clicks Schedule Appointment
      # Then the response is recorded against the token's appId
      it 'records the action from a next-steps page token' do
        post :record_response, params: {
          t: JsonWebTokenService.encode_token(page_claims.merge(purpose: 'next_steps')),
          record: { action: 'appointment' },
        }

        expect(response).to have_http_status(:ok)
        expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response).with(
          application_id,
          'appointment',
        )
      end

      # Given an act-less token without the next-steps purpose, as the documents page used
      #   to sign from raw query params for any appId (these tokens never expire)
      # When it is posted to record a response
      # Then it is rejected
      it 'returns unauthorized for an act-less token not minted for next-steps' do
        post :record_response, params: {
          t: JsonWebTokenService.encode_token(page_claims),
          record: { action: 'appointment' },
        }

        expect(response).to have_http_status(:unauthorized)
        expect(DahliaBackend::MessageService)
          .not_to have_received(:send_invite_to_response)
      end
    end
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
        browser: {
          webdriver: false, userAgent: 'Mozilla/5.0 FBAN/FBIOS', coarsePointer: true
        },
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

    # NOTE: ActionController::Parameters stringifies scalars, so browser booleans
    # serialize as "false"/"true" rather than JSON booleans. Harmless for querying,
    # but assert what we actually emit.
    it 'includes the passive browser snapshot for post-hoc classification' do
      post :log_human_verified, params: { record: valid_record }

      expect(Rails.logger).to have_received(:info).with(
        a_string_including('"browser":', '"userAgent":"Mozilla/5.0 FBAN/FBIOS"',
                           '"webdriver":"false"'),
      )
    end

    it 'drops unknown browser keys, nested values, and over-long values' do
      logged = []
      allow(Rails.logger).to receive(:info) { |msg| logged << msg.to_s }

      post :log_human_verified, params: {
        record: valid_record.merge(
          browser: {
            userAgent: 'a' * 400,
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

    # Unauthenticated endpoint: every logged value is bounded, not just the browser hash.
    it 'truncates over-long top-level fields' do
      logged = []
      allow(Rails.logger).to receive(:info) { |msg| logged << msg.to_s }

      post :log_human_verified, params: {
        record: valid_record.merge(type: 'T' * 5000, act: 'A' * 5000),
      }

      expect(response).to be_ok
      event = logged.find { |msg| msg.start_with?('invite_to.response ') }
      expect(event).not_to include('T' * 300)
      expect(event).not_to include('A' * 300)
      expect(event.length).to be < 3000
    end

    # to_unsafe_h converts nested ActionController::Parameters to HashWithIndifferentAccess,
    # so the non-scalar filter catches them - assert that on an allow-listed key.
    it 'drops a nested structure sent under an allow-listed browser key' do
      logged = []
      allow(Rails.logger).to receive(:info) { |msg| logged << msg.to_s }

      post :log_human_verified, params: {
        record: valid_record.merge(
          browser: { userAgent: { nested: { deep: 'sneaky-value' } }, timezone: 'UTC' },
        ),
      }

      expect(response).to be_ok
      event = logged.find { |msg| msg.start_with?('invite_to.response ') }
      expect(event).not_to include('sneaky-value')
      expect(event).to include('"timezone":"UTC"')
    end

    it 'omits the browser hash entirely when no recognized keys are supplied' do
      post :log_human_verified, params: {
        record: valid_record.merge(browser: { evil: 'nope' }),
      }

      expect(response).to be_ok
      expect(Rails.logger).not_to have_received(:info).with(a_string_including('"browser":'))
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
