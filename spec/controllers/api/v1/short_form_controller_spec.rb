# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Api::V1::ShortFormController, type: :controller do
  shared_context 'with a housing counselor session' do
    let(:counselor_contact_id) { 'contact_counselor_abc123' }
    let(:applicant_contact_id) { 'contact_applicant_abc123' }
    let(:clerk_sid) { 'sid_abc123' }
    before do
      stub_const('JsonWebTokenService::SECRET_KEY', 'test_secret')
      stub_const('JsonWebTokenService::ALGORITHM', 'HS256')
      stub_const('JsonWebTokenService::ALLOWED_ALGORITHMS', ['HS256'])
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .with(HousingCounselorSession::FEATURE_FLAG).and_return(true)

      allow(ClerkOrDeviseAuth).to receive(:clerk_enabled?).and_return(true)
      allow(controller).to receive(:clerk).and_return(
        double(user_id: 'user_counselor', session: { 'sid' => clerk_sid }),
      )
      allow(ClerkService).to receive(:salesforce_contact_id)
        .and_return(counselor_contact_id)

      request.cookies['hc_session'] = JsonWebTokenService.encode_token(
        { 'typ' => 'hc_session', 'hcId' => counselor_contact_id,
          'appId' => applicant_contact_id, 'sid' => clerk_sid },
        exp: 2.hours.from_now,
      )
    end
  end
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
      allow(Force::ShortFormService).to receive(:create_or_update)
        .and_return(response_data)
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

      it 'submits an anonymous application' do
        allow(controller).to receive(:clerk).and_return(nil)

        post :submit_application

        expect(response).to have_http_status(:ok)
        expect(Force::ShortFormService).to have_received(:create_or_update)
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

      # Given an applicant signed in with Clerk, no delegate session, and the HC flag on
      # When the applicant submits an application
      # Then the top-level submittedBy is the applicant's own contact id
      context 'with the housing counselor flag on and no delegate session' do
        before do
          allow(Rails.configuration.unleash).to receive(:is_enabled?)
            .with(HousingCounselorSession::FEATURE_FLAG).and_return(true)
        end

        it 'records the signed-in applicant as submittedBy' do
          allow(controller).to receive(:clerk).and_return(double(user_id: 'user_abc123'))
          allow(ClerkService).to receive(:salesforce_contact_id)
            .and_return('contact_abc123')

          post :submit_application

          expect(Force::ShortFormService).to have_received(:create_or_update)
            .with(hash_including(submittedBy: 'contact_abc123'), anything)
        end
      end
    end
    # Given a counselor with an hc_session cookie and the housing counselor flag off
    # When the counselor submits an application
    # Then it is filed under the counselor's own contact id and webAppID
    context 'with the Housing Counselor flag off' do
      include_context 'with a housing counselor session'
      before do
        allow(Rails.configuration.unleash).to receive(:is_enabled?)
          .with(HousingCounselorSession::FEATURE_FLAG).and_return(false)
        allow(controller).to receive(:applicant_attrs).and_call_original
      end
      it 'submits the application with the counselors own contact id and webAppID' do
        post :submit_application

        expect(Force::ShortFormService).to have_received(:create_or_update)
          .with(anything, hash_including(contactId: counselor_contact_id,
                                         webAppID: 'user_counselor'))
      end
    end

    # Given a counselor signed in with Clerk and a valid hc_session for an applicant
    # When the counselor submits an application
    # Then Salesforce receives the applicant's contact id, not the counselor's
    context 'when signed in as a housing counselor with a valid hc_session cookie' do
      include_context 'with a housing counselor session'
      before { allow(controller).to receive(:applicant_attrs).and_call_original }
      it "files the application under the applicant's contact id" do
        post :submit_application

        expect(Force::ShortFormService).to have_received(:create_or_update)
          .with(anything, hash_including(contactId: applicant_contact_id))
      end

      it "does not send the counselor's webAppID on the applicant's record" do
        post :submit_application

        expect(Force::ShortFormService).to have_received(:create_or_update)
          .with(anything, hash_excluding(:webAppID))
      end

      # Given a counselor with a valid delegate session
      # When the counselor submits an application
      # Then the top-level submittedBy is the counselor's contact id
      it 'records the counselor as submittedBy' do
        post :submit_application

        expect(Force::ShortFormService).to have_received(:create_or_update)
          .with(hash_including(submittedBy: counselor_contact_id), anything)
      end
    end
  end

  describe '#update_application' do
    # Given a counselor with a valid hc_session for applicant A
    # When the counselor saves a draft owned by applicant B
    # Then the response is 401 and nothing is sent to Salesforce
    context 'when signed in as a housing counselor with a valid hc_session cookie' do
      include_context 'with a housing counselor session'

      let(:update_params) do
        { id: 'app123',
          application: { id: 'app123', status: 'draft', listingID: 'listing123',
                         primaryApplicant: { email: 'test@example.com' } } }
      end

      def draft_owned_by(contact_id)
        { 'id' => 'app123', 'status' => 'Draft',
          'primaryApplicant' => { 'contactId' => contact_id } }
      end

      before do
        allow(Force::ShortFormService).to receive(:create_or_update)
          .and_return('id' => 'app123')
        allow(controller).to receive(:process_submit_app_response)
      end

      it "saves the delegated applicant's own draft" do
        allow(Force::ShortFormService).to receive(:get)
          .and_return(draft_owned_by(applicant_contact_id))

        put :update_application, params: update_params

        expect(response).to have_http_status(:ok), response.body
        expect(Force::ShortFormService).to have_received(:create_or_update)
      end

      it 'rejects a draft owned by a different applicant' do
        allow(Force::ShortFormService).to receive(:get)
          .and_return(draft_owned_by('different_contact_123'))

        put :update_application, params: update_params
        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:create_or_update)
      end
    end
  end

  describe '#delete_proof' do
    let(:contact_id) { 'contact_abc123' }
    let(:devise_user) { create(:user, salesforce_contact_id: contact_id) }
    let(:proof_params) do
      { session_uid: 'new_session', listing_id: '123',
        listing_preference_id: 'pref1', document_type: 'gas bill' }
    end
    let!(:devise_file) do
      create(:uploaded_file, user_id: devise_user.id.to_s,
                             listing_preference_id: 'pref1')
    end
    let!(:other_file) do
      create(:uploaded_file, user_id: 'someone_else', listing_preference_id: 'pref1')
    end

    it "deletes the Devise user's proof" do
      allow(controller).to receive(:current_user).and_return(devise_user)
      allow(controller).to receive(:user_signed_in?).and_return(true)

      delete :delete_proof, params: { uploaded_file: proof_params }

      expect(UploadedFile.exists?(devise_file.id)).to be(false)
      expect(UploadedFile.exists?(other_file.id)).to be(true)
    end

    # TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
    it 'deletes a proof uploaded under Devise for a Clerk user with the same contact' do
      allow(ClerkOrDeviseAuth).to receive(:clerk_enabled?).and_return(true)
      allow(controller).to receive(:clerk).and_return(double(user_id: 'user_abc123'))
      allow(ClerkService).to receive(:salesforce_contact_id).and_return(contact_id)

      delete :delete_proof, params: { uploaded_file: proof_params }

      expect(UploadedFile.exists?(devise_file.id)).to be(false)
      expect(UploadedFile.exists?(other_file.id)).to be(true)
    end
  end

  describe '#show_listing_application_for_user' do
    let(:contact_id) { 'contact_abc123' }

    # TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
    it 'includes proofs uploaded under Devise for a Clerk user with the same contact' do
      allow(ClerkOrDeviseAuth).to receive(:clerk_enabled?).and_return(true)
      allow(controller).to receive(:clerk).and_return(double(user_id: 'user_abc123'))
      allow(ClerkService).to receive(:salesforce_contact_id).and_return(contact_id)
      allow(Force::ShortFormService).to receive(:find_listing_application).and_return({})
      devise_user = create(:user, salesforce_contact_id: contact_id)
      devise_file = create(:uploaded_file, user_id: devise_user.id.to_s)
      create(:uploaded_file, user_id: 'someone_else')

      get :show_listing_application_for_user, params: { listing_id: '123' }

      file_ids = JSON.parse(response.body)['files'].map { |f| f['id'] }
      expect(file_ids).to eq([devise_file.id])
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

    context 'with the Clerk flag on and no Clerk session' do
      before do
        allow(ClerkOrDeviseAuth).to receive(:clerk_enabled?).and_return(true)
        allow(controller).to receive(:clerk).and_return(nil)
      end

      it 'rejects the request' do
        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('error' => 'Invalid Clerk session')
        expect(Force::ShortFormService).not_to have_received(:delete)
      end

      it 'does not fall back to a Devise session' do
        allow(controller).to receive(:warden)
          .and_return(double(authenticate: create(:user)))

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
