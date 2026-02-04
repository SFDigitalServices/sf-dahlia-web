# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Api::V1::ShortFormController, type: :controller do
  describe '#submit_application' do
    let(:application_params) do
      {
        status: 'submitted',
        primaryApplicant: { email: 'test@example.com' },
        listingID: '12345',
        id: '12345',
        applicationLanguage: 'en',
        locale: 'en',
        action: 'submit',
      }
    end

    let(:params) do
      ActionController::Parameters.new(
        application: application_params,
        uploaded_file: { file: 'file.pdf' },
      )
    end

    let(:emailer_params) do
      {
        locale: nil,
        email: 'test@example.com',
        listing_id: '12345',
        lottery_number: '67890',
        first_name: 'John',
        last_name: 'Doe',
      }
    end

    let(:applicant_attrs) do
      {
        contactId: 'user_contact_id',
        webAppID: 'current_user_id',
      }
    end

    let(:response_data) do
      {
        'lotteryNumber' => '67890',
        'primaryApplicant' => {
          'firstName' => 'John',
          'lastName' => 'Doe',
        },
      }
    end

    before do
      allow(controller).to receive(:params).and_return(params)
      allow(controller).to receive(:application_params).and_return(application_params)
      allow(controller).to receive(:applicant_attrs).and_return(applicant_attrs)
      allow(Force::ShortFormService).to receive(:create_or_update).and_return(response_data)
      allow(DahliaBackend::MessageService).to receive(:send_application_confirmation)
    end

    it 'submits the application and sends confirmation using new message service' do
      allow(Rails.configuration).to receive_message_chain(:unleash,
                                                          :is_enabled?).and_return(true)

      # Precise expectations with arguments
      expect(Force::ShortFormService).to receive(:create_or_update)
        .with(application_params, applicant_attrs)
        .and_return(response_data)

      expect(DahliaBackend::MessageService).to receive(:send_application_confirmation)
        .with(application_params, response_data, nil)

      post :submit_application
      expect(response).to have_http_status(:ok)
    end
  end

  describe '#lending_institutions' do
    it 'retrieves lending institutions' do
      expect(Force::ShortFormService).to receive(:lending_institutions)
      get :lending_institutions
    end
  end

  describe '#lending_institutions_dalp' do
    it 'retrieves DALP lending institutions' do
      expect(Force::ShortFormService).to receive(:lending_institutions_dalp)
      get :lending_institutions_dalp
    end
  end
end
