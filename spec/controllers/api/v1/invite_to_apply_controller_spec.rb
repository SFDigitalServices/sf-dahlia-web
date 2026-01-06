# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::InviteToApplyController do
  let(:deadline) { '2099-01-01' }
  let(:expired_deadline) { '1999-01-01' }
  let(:application_number) { 'a0o123' }
  let(:response_type) { 'submit' }
  let(:listing_id) { 'a0W123' }
  let(:valid_params) do
    {
      record: {
        deadline: deadline,
        applicationNumber: application_number,
        response: response_type,
        listingId: listing_id,
      },
    }
  end
  let(:expired_deadline_params) do
    {
      record: {
        deadline: expired_deadline,
        applicationNumber: application_number,
        response: response_type,
        listingId: listing_id,
      },
    }
  end
  let(:invalid_params) do
    {
      record: {
        deadline: '',
        response: response_type,
        listingId: listing_id,
      },
    }
  end
  describe '#record_response' do
    before do
      allow(DahliaBackend::MessageService).to receive(:send_invite_to_apply_response)
    end

    it 'passes params to messaging service for valid params' do
      post :record_response, params: valid_params
      expect(DahliaBackend::MessageService)
        .to have_received(:send_invite_to_apply_response).with(
          deadline,
          application_number,
          response_type,
          listing_id,
        )
      expect(response).to be_ok
    end

    it 'does not pass params to messaging service for expired deadline' do
      post :record_response, params: expired_deadline_params
      expect(DahliaBackend::MessageService)
        .not_to have_received(:send_invite_to_apply_response)
      expect(response).to be_ok
    end

    it 'returns an error for invalid params' do
      post :record_response, params: invalid_params
      expect(DahliaBackend::MessageService)
        .not_to have_received(:send_invite_to_apply_response)
      expect(response).not_to be_ok
    end
  end
end
