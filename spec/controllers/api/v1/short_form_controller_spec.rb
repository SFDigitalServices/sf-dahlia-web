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
      allow(Force::ShortFormService).to receive(:get_for_user).and_return([])
      allow(DahliaBackend::MessageService).to receive(:send_application_confirmation)
    end

    it 'submits the application and sends confirmation using new message service' do
      # Precise expectations with arguments
      expect(Force::ShortFormService).to receive(:create_or_update)
        .with(application_params, applicant_attrs)
        .and_return(response_data)

      expect(DahliaBackend::MessageService).to receive(:send_application_confirmation)
        .with(application_params, response_data, nil)

      post :submit_application
      expect(response).to have_http_status(:ok)
    end

    context 'with the Clerk flag on' do
      before { allow(ClerkOrDeviseAuth).to receive(:clerk_enabled?).and_return(true) }

      it 'rejects an anonymous submission' do
        allow(controller).to receive(:clerk).and_return(nil)

        post :submit_application

        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:create_or_update)
      end

      it 'rejects a Devise user without a Clerk session' do
        allow(controller).to receive(:clerk).and_return(nil)
        allow(controller).to receive(:warden)
          .and_return(double(authenticate: create(:user)))

        post :submit_application

        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:create_or_update)
      end

      it 'submits the application for a Clerk user' do
        allow(controller).to receive(:clerk).and_return(double(user_id: 'user_abc123'))
        allow(ClerkService).to receive(:salesforce_contact_id)
          .and_return('contact_abc123')

        post :submit_application

        expect(response).to have_http_status(:ok)
        expect(Force::ShortFormService).to have_received(:create_or_update)
      end

      it 'refuses to submit when the Salesforce contact id lookup fails' do
        allow(controller).to receive(:clerk).and_return(double(user_id: 'user_abc123'))
        allow(ClerkService).to receive(:salesforce_contact_id).and_raise(StandardError)

        post :submit_application

        expect(response).to have_http_status(:service_unavailable)
        expect(Force::ShortFormService).not_to have_received(:create_or_update)
      end
    end
  end

  describe '#delete_application' do
    let(:clerk_user_id) { 'user_abc123' }
    let(:contact_id) { 'contact_abc123' }
    let(:application) do
      {
        'id' => 'app123',
        'status' => 'Draft',
        'primaryApplicant' => { 'contactId' => contact_id },
      }
    end

    before do
      allow(Force::ShortFormService).to receive(:get).and_return(application)
      allow(Force::ShortFormService).to receive(:delete).and_return(success: true)
    end

    context 'with the Clerk flag on and a Clerk session' do
      before do
        allow(ClerkOrDeviseAuth).to receive(:clerk_enabled?).and_return(true)
        allow(controller).to receive(:clerk).and_return(double(user_id: clerk_user_id))
        allow(ClerkService).to receive(:salesforce_contact_id)
          .with(clerk_user_id)
          .and_return(contact_id)
      end

      it 'deletes a draft application owned by the Clerk user' do
        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:ok)
        expect(Force::ShortFormService).to have_received(:delete).with('app123')
      end

      it 'does not delete an application owned by another user' do
        allow(ClerkService).to receive(:salesforce_contact_id)
          .with(clerk_user_id)
          .and_return('some_other_contact_id')

        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:delete)
      end

      it 'does not delete a submitted application' do
        allow(Force::ShortFormService).to receive(:get)
          .and_return(application.merge('status' => 'Submitted'))

        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:delete)
      end

      # ClerkService::User rescues a failed contact id lookup and returns nil, so
      # without this guard nil would match an application with no contact id.
      it 'does not delete when the Clerk user has no Salesforce contact id' do
        allow(ClerkService).to receive(:salesforce_contact_id)
          .with(clerk_user_id)
          .and_raise(StandardError)
        allow(Force::ShortFormService).to receive(:get)
          .and_return(application.merge('primaryApplicant' => { 'contactId' => nil }))

        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:delete)
      end
    end

    # TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
    # Goes with the flag, along with ClerkOrDeviseAuth.
    context 'with the Clerk flag off' do
      it 'ignores a Clerk session and uses Devise' do
        allow(controller).to receive(:clerk).and_return(double(user_id: clerk_user_id))

        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:delete)
      end

      it 'rejects an unauthenticated request' do
        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:delete)
      end

      # Regression: a second before_action :authenticate_user! replaced this one,
      # so the action ran with only user_can_access? guarding it.
      it 'rejects an unauthenticated request before loading the application' do
        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:get)
      end

      it 'deletes a draft application owned by the Devise user' do
        user = create(:user, salesforce_contact_id: contact_id)
        allow(controller).to receive(:current_user).and_return(user)

        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:ok)
        expect(Force::ShortFormService).to have_received(:delete).with('app123')
      end
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
