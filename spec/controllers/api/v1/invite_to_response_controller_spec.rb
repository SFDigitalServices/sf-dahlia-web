# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::InviteToResponseController do
  let(:deadline) { '2099-01-01' }
  let(:application_id) { 'a0o123' }
  let(:response_type) { 'submit' }
  let(:listing_id) { 'a0W123' }
  describe '#record_response' do
    before do
      allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
    end

    it 'passes params to messaging service for valid params' do
      post :record_response, params: {
        record: {
          deadline: deadline,
          appId: application_id,
          applicationNumber: application_id,
          response: response_type,
          action: response_type,
          listingId: listing_id,
        },
      }
      expect(DahliaBackend::MessageService)
        .to have_received(:send_invite_to_response).with(
          deadline,
          application_id,
          application_id,
          response_type,
          response_type,
          listing_id,
        )
      expect(response).to be_ok
    end

    it 'does not pass params to messaging service for expired deadline' do
      post :record_response, params: {
        record: {
          deadline: '1999-01-01',
          appId: application_id,
          applicationNumber: application_id,
          response: response_type,
          action: response_type,
          listingId: listing_id,
        },
      }
      expect(DahliaBackend::MessageService)
        .not_to have_received(:send_invite_to_response)
      expect(response).to be_ok
    end

    it 'returns an error for invalid params' do
      post :record_response, params: {
        record: {
          deadline: '',
          appId: application_id,
          applicationNumber: application_id,
          response: response_type,
          action: response_type,
          listingId: listing_id,
        },
      }
      expect(DahliaBackend::MessageService)
        .not_to have_received(:send_invite_to_response)
      expect(response).not_to be_ok
    end
  end

  describe '#log_human_verified' do
    let(:valid_record) do
      {
        type: 'I2A',
        deadline: deadline,
        appId: application_id,
        listingId: listing_id,
        act: 'yes',
        trigger: 'interaction',
        elapsedMs: 1234,
      }
    end

    before do
      allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
      allow(Rails.logger).to receive(:info)
    end

    it 'logs the human-verified click and records nothing' do
      post :log_human_verified, params: { record: valid_record }

      expect(response).to be_ok
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      expect(Rails.logger).to have_received(:info).with(
        a_string_including(
          'InviteToResponseController#log_human_verified:',
          'human-verified click (shadow, not recorded)',
          "appId=#{application_id.inspect}",
          'act="yes"',
          'trigger="interaction"',
          'elapsedMs="1234"',
        ),
      )
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
