require 'rails_helper'

RSpec.describe Api::V1::AccountController, type: :controller do
  describe 'PUT #update' do
    let(:user) { create(:user) }
    let(:contact_params) { { DOB: '2000-01-01' } }

    before do
      allow(controller).to receive(:current_user).and_return(user)
      allow(Force::AccountService).to receive(:create_or_update)
      allow(Emailer).to receive_message_chain(:account_update, :deliver_later)
    end

    context 'when DOB is valid' do
      it 'updates the account and returns the contact' do
        put :update, params: { contact: contact_params }

        expect(response).to have_http_status(:ok)
        expect(Force::AccountService).to have_received(:create_or_update)
        expect(Emailer).to have_received(:account_update)
      end
    end

    context 'when DOB is invalid' do
      let(:contact_params) { { DOB: '1800-02-03' } }

      it 'returns an error' do
        put :update, params: { contact: contact_params }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.body).to match(/Invalid DOB/)
        expect(Force::AccountService).not_to have_received(:create_or_update)
        expect(Emailer).not_to have_received(:account_update)
      end
    end
  end
end