require 'rails_helper'

RSpec.describe Api::V1::AccountController, type: :controller do
  let(:user) { create(:user) }

  before do
    allow(controller).to receive(:current_user).and_return(user)
    allow(Force::AccountService).to receive(:create_or_update)
    allow(Emailer).to receive_message_chain(:account_update, :deliver_later)
    allow(DahliaBackend::MessageService).to receive(:send_housing_counselor_access)
  end

  describe 'PUT #update' do
    let(:contact_params) { { DOB: '2000-01-01' } }

    context 'when DOB is valid' do
      it 'updates the account and returns the contact' do
        put :update, params: { contact: contact_params }

        expect(response).to have_http_status(:ok)
        expect(Force::AccountService).to have_received(:create_or_update)
        expect(Emailer).to have_received(:account_update)
        expect(DahliaBackend::MessageService).not_to have_received(:send_housing_counselor_access)
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

  describe 'PUT #update_housing_counselor' do
    let(:salesforce_contact) do
      {
        'firstName' => 'Test',
        'housingCounselingAgencyId' => '123',
      }
    end
    let(:contact_params) do
      {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        DOB: '2000-01-01',
        housingCounselingAgencyId: '123',
      }
    end

    before do
      allow(Force::AccountService).to receive(:create_or_update).and_return(salesforce_contact)
    end

    it 'grants housing counselor access and sends the messaging service request' do
      put :update_housing_counselor, params: { contact: contact_params }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('contact' => salesforce_contact)
      expect(Force::AccountService).to have_received(:create_or_update).with(
        hash_including(
          'firstName' => 'Test',
          'lastName' => 'User',
          'email' => 'test@test.com',
          'DOB' => '2000-01-01',
          'housingCounselingAgencyId' => '123',
          'contactID' => user.salesforce_contact_id,
          'webAppID' => user.id,
        ),
      )
      expect(DahliaBackend::MessageService).to have_received(:send_housing_counselor_access).with(
        housing_counselor_action: 'ACCESS_GRANTED',
        contact_id: user.salesforce_contact_id,
        agency_id: '123',
      )
      expect(Emailer).not_to have_received(:account_update)
    end

    it 'revokes housing counselor access and sends the messaging service request' do
      allow(Force::AccountService).to receive(:get).and_return(
        { 'housingCounselingAgencyId' => '123' },
      )

      put :update_housing_counselor, params: {
        contact: contact_params.merge(housingCounselingAgencyId: ''),
      }

      expect(Force::AccountService).to have_received(:create_or_update).with(
        hash_including(
          'firstName' => 'Test',
          'housingCounselingAgencyId' => '',
          'contactID' => user.salesforce_contact_id,
        ),
      )
      expect(DahliaBackend::MessageService).to have_received(:send_housing_counselor_access).with(
        housing_counselor_action: 'ACCESS_REVOKED',
        contact_id: user.salesforce_contact_id,
        agency_id: '123',
      )
      expect(Emailer).not_to have_received(:account_update)
    end
  end
end
