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
end
