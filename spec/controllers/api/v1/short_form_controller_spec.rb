# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Api::V1::ShortFormController, type: :controller do
  let(:submitted_by_keys) { %i[submittedBy submittedById] }

  shared_context 'with a housing counselor session' do
    let(:counselor_contact_id) { 'contact_counselor_abc123' }
    let(:applicant_contact_id) { 'contact_applicant_abc123' }
    let(:clerk_sid) { 'sid_abc123' }
    let(:agency_id) { 'agency_abc123' }
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
      allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
        applicant_contact_id: applicant_contact_id,
        counselor_contact_id: counselor_contact_id,
      )
      allow(ClerkService).to receive(:revoke_session)
      allow(Force::AccountService).to receive(:get)
        .with(applicant_contact_id)
        .and_return('webAppID' => 'user_applicant',
                    'housingCounselingAgencyId' => agency_id)

      issue_hc_session_cookie
    end

    # Defaults are a valid, unexpired session bound to the current Clerk
    # session; pass only what a test changes.
    def issue_hc_session_cookie(sid: clerk_sid, exp: 2.hours.from_now)
      request.cookies['hc_session'] = JsonWebTokenService.encode_token(
        { 'typ' => 'hc_session', 'hcId' => counselor_contact_id,
          'appId' => applicant_contact_id, 'sid' => sid },
        exp:,
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
        let(:signed_in_applicant_clerk) do
          double(user_id: 'user_abc123', session: { 'sid' => 'sid_applicant' })
        end

        before do
          allow(Rails.configuration.unleash).to receive(:is_enabled?)
            .with(HousingCounselorSession::FEATURE_FLAG).and_return(true)
        end

        it 'records the signed-in applicant as submittedBy' do
          allow(controller).to receive(:clerk).and_return(signed_in_applicant_clerk)
          allow(ClerkService).to receive(:salesforce_contact_id)
            .and_return('contact_abc123')

          post :submit_application

          expect(Force::ShortFormService).to have_received(:create_or_update)
            .with(hash_including(submittedBy: 'contact_abc123'), anything)
        end

        # Given an applicant signed in with Clerk, no delegate session, and the HC flag on
        # When the applicant submits an application
        # Then submittedById is the applicant's own contact id
        it 'records the signed-in applicant as submittedById' do
          allow(controller).to receive(:clerk).and_return(signed_in_applicant_clerk)
          allow(ClerkService).to receive(:salesforce_contact_id)
            .and_return('contact_abc123')

          post :submit_application

          expect(Force::ShortFormService).to have_received(:create_or_update)
            .with(hash_including(submittedById: 'contact_abc123'), anything)
        end

        # Given a guest (not signed in) and the HC flag on
        # When the guest submits an application
        # Then no submittedBy fields are sent
        it 'does not send submittedBy for a guest' do
          allow(controller).to receive(:clerk).and_return(nil)

          post :submit_application

          expect(Force::ShortFormService).to have_received(:create_or_update)
            .with(hash_excluding(*submitted_by_keys), anything)
        end
      end

      # Given an applicant signed in with Clerk and the HC flag off
      # When the applicant submits an application
      # Then no submittedBy is sent, as before this ticket
      context 'with the housing counselor flag off' do
        before do
          allow(Rails.configuration.unleash).to receive(:is_enabled?)
            .with(HousingCounselorSession::FEATURE_FLAG).and_return(false)
        end

        it 'does not send submittedBy for a signed-in applicant' do
          allow(controller).to receive(:clerk).and_return(double(user_id: 'user_abc123'))
          allow(ClerkService).to receive(:salesforce_contact_id)
            .and_return('contact_abc123')

          post :submit_application

          expect(Force::ShortFormService).to have_received(:create_or_update)
            .with(hash_excluding(*submitted_by_keys), anything)
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

      # Given a counselor with a valid delegate session for an applicant
      # When the counselor submits an application
      # Then primaryApplicant keeps the applicant's own webAppID, not the counselor's
      it "sends the applicant's own webAppID" do
        post :submit_application

        expect(Force::ShortFormService).to have_received(:create_or_update)
          .with(anything, hash_including(webAppID: 'user_applicant'))
      end

      # Given a counselor with a valid delegate session
      #   And the applicant's Contact has a housingCounselingAgencyId
      # When the counselor submits an application
      # Then primaryApplicant keeps that housingCounselingAgencyId,
      #   so the submit doesn't revoke the counselor's access
      it "keeps the applicant's housing counselor access" do
        post :submit_application

        expect(Force::ShortFormService).to have_received(:create_or_update)
          .with(anything, hash_including(housingCounselingAgencyId: agency_id))
      end

      # Given a counselor with a valid delegate session
      #   And the applicant's record can't be loaded
      # When the counselor submits an application
      # Then nothing is sent to Salesforce, so webAppID can't be blanked
      it 'does not submit when the applicant record cannot be loaded' do
        allow(Force::AccountService).to receive(:get).and_return(nil)

        post :submit_application

        expect(response).to have_http_status(:unauthorized)
        expect(Force::ShortFormService).not_to have_received(:create_or_update)
      end

      # Given a counselor with a valid delegate session
      #   And the applicant's record can't be loaded
      # When the counselor submits an application
      # Then hc_session is cleared and their Clerk session is revoked once
      it 'ends the HC session when the applicant record cannot be loaded' do
        allow(Force::AccountService).to receive(:get).and_return(nil)

        post :submit_application

        expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
        expect(cookies[:hc_session]).to be_blank
        expect(ClerkService).to have_received(:revoke_session).with(clerk_sid).once
      end

      # Given a counselor with a valid delegate session
      #   And the Clerk lookup of the counselor's contact id fails
      # When the counselor submits an application
      # Then the response is 401 hc_session_ended (not the generic 503),
      #   hc_session is cleared, their Clerk session is revoked once,
      #   and nothing is sent to Salesforce
      it 'ends the HC session when the counselor contact id lookup fails' do
        allow(ClerkService).to receive(:salesforce_contact_id).and_raise(StandardError)

        post :submit_application

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
        expect(cookies[:hc_session]).to be_blank
        expect(ClerkService).to have_received(:revoke_session).with(clerk_sid).once
        expect(Force::ShortFormService).not_to have_received(:create_or_update)
      end

      # Given a counselor with a valid delegate session
      # When the counselor submits an application
      # Then the top-level submittedBy is the counselor's contact id
      it 'records the counselor as submittedBy' do
        post :submit_application

        expect(Force::ShortFormService).to have_received(:create_or_update)
          .with(hash_including(submittedBy: counselor_contact_id), anything)
      end

      # Given a counselor with a valid delegate session
      # When the counselor submits an application
      # Then the top-level submittedById is the counselor's contact id
      it 'records the counselor as submittedById' do
        post :submit_application

        expect(Force::ShortFormService).to have_received(:create_or_update)
          .with(hash_including(submittedById: counselor_contact_id), anything)
      end

      # Given a counselor whose hc_session has expired
      #   And Salesforce no longer grants delegation
      # When the counselor submits an application
      # Then nothing is submitted, hc_session is cleared,
      #   and their Clerk session is revoked
      context 'when Salesforce has revoked delegation' do
        before do
          issue_hc_session_cookie(exp: 1.hour.ago)
          allow(Force::HousingCounselorService).to receive(:authorize_access)
            .and_return(nil)
        end

        it 'does not submit and clears hc_session' do
          post :submit_application

          expect(response).to have_http_status(:forbidden)
          expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
          expect(Force::ShortFormService).not_to have_received(:create_or_update)
          expect(cookies[:hc_session]).to be_blank
        end

        it "revokes the counselor's Clerk session once" do
          post :submit_application

          expect(ClerkService).to have_received(:revoke_session).with(clerk_sid).once
        end
      end

      # Given a counselor whose hc_session cookie was issued in a different Clerk session
      # When the counselor submits an application
      # Then nothing is submitted, the response is 403 hc_session_ended,
      #   and hc_session is cleared
      context 'when the hc_session cookie is from a different Clerk session' do
        before do
          issue_hc_session_cookie(sid: 'sid_other_session')
        end

        it 'does not submit and clears hc_session' do
          post :submit_application

          expect(response).to have_http_status(:forbidden)
          expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
          expect(Force::ShortFormService).not_to have_received(:create_or_update)
          expect(cookies[:hc_session]).to be_blank
        end
      end

      # Given an hc_session cookie and a request with no Clerk session id
      # When the counselor submits an application
      # Then nothing is submitted, the response is 403 hc_session_ended,
      #   and no Clerk revoke is attempted (there is no session to revoke)
      context 'when the request has no Clerk session id' do
        before do
          allow(controller).to receive(:clerk)
            .and_return(double(user_id: 'user_counselor', session: {}))
        end

        it 'does not submit or try to revoke a Clerk session' do
          post :submit_application

          expect(response).to have_http_status(:forbidden)
          expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
          expect(Force::ShortFormService).not_to have_received(:create_or_update)
          expect(ClerkService).not_to have_received(:revoke_session)
        end
      end

      # Given an unexpired hc_session and Salesforce still grants delegation
      # When the counselor submits an application
      # Then Salesforce is checked once and the application is submitted
      context 'with an unexpired hc_session that Salesforce still grants' do
        it 're-checks delegation once and submits' do
          post :submit_application

          expect(Force::HousingCounselorService).to have_received(:authorize_access).once
          expect(Force::ShortFormService).to have_received(:create_or_update)
        end
      end

      # Given an unexpired hc_session and Salesforce has revoked delegation
      # When the counselor submits an application
      # Then nothing is submitted, hc_session is cleared,
      #   and their Clerk session is revoked
      context 'with an unexpired hc_session that Salesforce has revoked' do
        before do
          allow(Force::HousingCounselorService).to receive(:authorize_access)
            .and_return(nil)
        end

        it 'does not submit, clears hc_session, and revokes the Clerk session' do
          post :submit_application

          expect(response).to have_http_status(:forbidden)
          expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
          expect(Force::ShortFormService).not_to have_received(:create_or_update)
          expect(cookies[:hc_session]).to be_blank
          expect(ClerkService).to have_received(:revoke_session).with(clerk_sid)
        end
      end

      # Given an unexpired hc_session and the Salesforce re-check errors
      # When the counselor submits an application
      # Then nothing is submitted, hc_session is cleared,
      #   and their Clerk session is revoked (fail closed)
      context 'when the Salesforce re-check errors' do
        before do
          allow(Force::HousingCounselorService).to receive(:authorize_access)
            .and_raise(Faraday::TimeoutError, 'timed out')
        end

        it 'does not submit and logs the counselor out' do
          post :submit_application

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
          expect(Force::ShortFormService).not_to have_received(:create_or_update)
          expect(cookies[:hc_session]).to be_blank
          expect(ClerkService).to have_received(:revoke_session).with(clerk_sid)
        end
      end

      # Given the applicant's proof and the counselor's own proof on the same listing
      # When the counselor submits the applicant's application
      # Then only the applicant's proof is attached in Salesforce
      it "attaches only the applicant's proofs" do
        allow(Force::ShortFormService).to receive(:queue_file_attachments)
        applicant_file =
          create(:uploaded_file, user_id: 'user_applicant', listing_id: '12345')
        create(:uploaded_file, user_id: 'user_counselor', listing_id: '12345')

        post :submit_application

        expect(Force::ShortFormService)
          .to have_received(:queue_file_attachments) do |_application_id, files|
            expect(files.map(&:id)).to eq([applicant_file.id])
          end
      end

      # Given a proof uploaded in this browser session
      # When the counselor saves the applicant's draft
      # Then the proof is owned by the applicant, not the counselor
      context 'when saving a draft' do
        let(:application_params) { super().merge(status: 'draft') }
        let(:params) do
          ActionController::Parameters.new(
            application: application_params,
            uploaded_file: { session_uid: 'session_abc123' },
          )
        end

        it "gives this session's proofs to the applicant" do
          session_file =
            create(:uploaded_file, user_id: nil, session_uid: 'session_abc123')

          post :submit_application

          expect(session_file.reload.user_id).to eq('user_applicant')
        end
      end
    end

    # Given this Clerk session was ended but Clerk couldn't revoke it
    #   And the hc_session cookie is already gone
    # When the counselor submits an application
    # Then nothing is filed under the counselor, and the revoke is tried again
    context 'when the Clerk session was ended but not revoked' do
      include_context 'with a housing counselor session'
      let(:cache_store) { ActiveSupport::Cache::MemoryStore.new }

      before do
        allow(Rails).to receive(:cache).and_return(cache_store)
        HousingCounselorSession.record_ended_clerk_session(clerk_sid)
        request.cookies.delete('hc_session')
      end

      it 'does not submit, even without an hc_session cookie' do
        post :submit_application

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
        expect(Force::ShortFormService).not_to have_received(:create_or_update)
      end

      it 'tries to revoke the Clerk session again' do
        post :submit_application

        expect(ClerkService).to have_received(:revoke_session).with(clerk_sid)
      end

      # Control: after signing in again, the counselor has a new Clerk session
      it 'lets a different Clerk session submit' do
        allow(controller).to receive(:clerk).and_return(
          double(user_id: 'user_counselor', session: { 'sid' => 'sid_new' }),
        )

        post :submit_application

        expect(response).to have_http_status(:ok), response.body
        expect(Force::ShortFormService).to have_received(:create_or_update)
      end

      it 'lets a guest with no Clerk session submit' do
        allow(controller).to receive(:clerk).and_return(nil)

        post :submit_application

        expect(response).to have_http_status(:ok), response.body
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

      # Given a counselor with a valid delegate session
      #   And the applicant's Contact has a housingCounselingAgencyId
      # When the counselor saves the applicant's draft
      # Then primaryApplicant keeps that housingCounselingAgencyId,
      #   so the save doesn't revoke the counselor's access
      it "keeps the applicant's housing counselor access when saving a draft" do
        allow(Force::ShortFormService).to receive(:get)
          .and_return(draft_owned_by(applicant_contact_id))

        put :update_application, params: update_params

        expect(Force::ShortFormService).to have_received(:create_or_update)
          .with(anything, hash_including(housingCounselingAgencyId: agency_id))
      end

      it 'rejects a draft owned by a different applicant' do
        allow(Force::ShortFormService).to receive(:get)
          .and_return(draft_owned_by('different_contact_123'))

        put :update_application, params: update_params

        expect(response).to have_http_status(:unauthorized)
        expect(response.body).not_to include('hc_session_ended')
        expect(Force::ShortFormService).not_to have_received(:create_or_update)
      end

      # Given a counselor with a valid delegate session
      # When the save request body includes submittedBy set to another contact id
      # Then Salesforce receives the counselor's contact id as submittedBy
      it 'ignores a client-sent submittedBy' do
        allow(Force::ShortFormService).to receive(:get)
          .and_return(draft_owned_by(applicant_contact_id))
        spoofed_params = update_params.deep_merge(
          application: { submittedBy: 'spoofed_contact_123' },
        )

        put :update_application, params: spoofed_params

        expect(Force::ShortFormService)
          .to have_received(:create_or_update) do |payload, _attrs|
            expect(payload.as_json['submittedBy']).to eq(counselor_contact_id)
          end
      end

      # Given a counselor with a valid delegate session
      # When the save request body sets primaryApplicant.housingCounselingAgencyId
      #   to another agency
      # Then Salesforce receives the applicant's stored agency id,
      #   so a counselor can't change who has access
      it 'ignores a client-sent housingCounselingAgencyId' do
        allow(Force::ShortFormService).to receive(:get)
          .and_return(draft_owned_by(applicant_contact_id))
        # Stub the HTTP call, not create_or_update, so its real merge! runs
        salesforce_request = instance_double(Force::Request, post: { 'id' => 'app123' })
        allow(Force::Request).to receive(:new)
          .with(retries: 0, timeout: 20)
          .and_return(salesforce_request)
        allow(Force::ShortFormService).to receive(:create_or_update).and_call_original
        spoofed_applicant = { housingCounselingAgencyId: 'spoofed_agency_123' }
        spoofed_params = update_params.deep_merge(
          application: { primaryApplicant: spoofed_applicant },
        )

        put :update_application, params: spoofed_params

        expect(salesforce_request).to have_received(:post) do |endpoint, body|
          expect(endpoint).to eq('/shortForm')
          expect(body.as_json.dig('primaryApplicant', 'housingCounselingAgencyId'))
            .to eq(agency_id)
        end
      end

      # Given a counselor with a valid delegate session
      # When the save request body sets submittedById to another contact id
      # Then Salesforce receives the counselor's contact id as submittedById
      it 'ignores a client-sent submittedById' do
        allow(Force::ShortFormService).to receive(:get)
          .and_return(draft_owned_by(applicant_contact_id))
        salesforce_request = instance_double(Force::Request, post: { 'id' => 'app123' })
        allow(Force::Request).to receive(:new)
          .with(retries: 0, timeout: 20)
          .and_return(salesforce_request)
        allow(Force::ShortFormService).to receive(:create_or_update).and_call_original
        spoofed_params = update_params.deep_merge(
          application: { submittedById: 'spoofed_contact_123' },
        )

        put :update_application, params: spoofed_params

        expect(salesforce_request).to have_received(:post) do |_endpoint, body|
          expect(body.as_json['submittedById']).to eq(counselor_contact_id)
        end
      end

      # Given an unexpired hc_session and Salesforce has revoked delegation
      # When the counselor saves a draft
      # Then the draft is neither read nor saved, hc_session is cleared,
      #   and their Clerk session is revoked
      context 'when Salesforce has revoked delegation' do
        before do
          allow(Force::ShortFormService).to receive(:get)
          allow(Force::HousingCounselorService).to receive(:authorize_access)
            .and_return(nil)
        end

        it 'does not read or save the draft, and logs the counselor out' do
          put :update_application, params: update_params

          expect(response).to have_http_status(:forbidden)
          expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
          expect(Force::ShortFormService).not_to have_received(:get)
          expect(Force::ShortFormService).not_to have_received(:create_or_update)
          expect(cookies[:hc_session]).to be_blank
          expect(ClerkService).to have_received(:revoke_session).with(clerk_sid)
        end
      end

      # Given a counselor whose hc_session cookie was issued in a different Clerk session
      # When the counselor saves a draft
      # Then the draft is neither read nor saved, and hc_session is cleared
      context 'when the hc_session cookie is from a different Clerk session' do
        before do
          allow(Force::ShortFormService).to receive(:get)
          issue_hc_session_cookie(sid: 'sid_other_session')
        end

        it 'does not read or save the draft' do
          put :update_application, params: update_params

          expect(response).to have_http_status(:forbidden)
          expect(Force::ShortFormService).not_to have_received(:get)
          expect(Force::ShortFormService).not_to have_received(:create_or_update)
          expect(cookies[:hc_session]).to be_blank
        end
      end
    end
  end

  # Given a counselor with an unexpired hc_session cookie
  #   And Salesforce has revoked delegation
  # When the counselor deletes a draft, claims an application,
  #   or uploads or deletes a proof
  # Then the response is 403 hc_session_ended and nothing is read, written, or deleted
  describe 'delegation re-check on other application writes' do
    include_context 'with a housing counselor session'

    let(:proof_params) do
      { uploaded_file: { session_uid: 'session_abc123', listing_id: 'listing123',
                         listing_preference_id: 'pref1', document_type: 'gas bill' } }
    end

    before do
      allow(Force::ShortFormService).to receive(:get)
      allow(Force::ShortFormService).to receive(:delete)
      allow(Force::ShortFormService).to receive(:create_or_update)
      allow(UploadedFile).to receive(:where)
      allow(UploadedFile).to receive(:create_and_resize)
    end

    context 'when Salesforce has revoked delegation' do
      before do
        allow(Force::HousingCounselorService).to receive(:authorize_access)
          .and_return(nil)
      end

      it 'does not read or delete the draft' do
        delete :delete_application, params: { id: 'app123' }

        expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
        expect(response).to have_http_status(:forbidden)
        expect(Force::ShortFormService).not_to have_received(:get)
        expect(Force::ShortFormService).not_to have_received(:delete)
      end

      it 'does not read or claim the application' do
        put :claim_submitted_application,
            params: { id: 'app123', application: { id: 'app123' } }

        expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
        expect(response).to have_http_status(:forbidden)
        expect(Force::ShortFormService).not_to have_received(:get)
        expect(Force::ShortFormService).not_to have_received(:create_or_update)
      end

      it 'does not remove or upload a proof' do
        post :upload_proof, params: proof_params

        expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
        expect(response).to have_http_status(:forbidden)
        expect(UploadedFile).not_to have_received(:where)
        expect(UploadedFile).not_to have_received(:create_and_resize)
      end

      it 'does not delete a proof' do
        delete :delete_proof, params: proof_params

        expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
        expect(response).to have_http_status(:forbidden)
        expect(UploadedFile).not_to have_received(:where)
      end
    end

    # Control: the same request with delegation still granted goes through
    context 'when Salesforce still grants delegation' do
      it "deletes the applicant's own draft" do
        applicant_draft = {
          'id' => 'app123', 'status' => 'Draft',
          'primaryApplicant' => { 'contactId' => applicant_contact_id }
        }
        allow(Force::ShortFormService).to receive(:get).and_return(applicant_draft)

        delete :delete_application, params: { id: 'app123' }

        expect(response).to have_http_status(:ok), response.body
        expect(Force::ShortFormService).to have_received(:delete).with('app123')
      end
    end
  end

  # Given a counselor with a valid hc_session for an applicant whose Contact webAppID is W
  # When they upload a proof
  # Then the proof is stored under W, the same owner as the application
  describe 'proofs while delegated' do
    include_context 'with a housing counselor session'

    let(:applicant_web_app_id) { 'user_applicant' }
    let(:proof_params) do
      { uploaded_file: {
        session_uid: 'session_abc123', listing_id: 'listing123',
        listing_preference_id: 'pref1', document_type: 'gas bill',
        file: fixture_file_upload('./app/assets/images/logo-city.png', 'image/png')
      } }
    end

    it 'stores an uploaded proof under the applicant, not the counselor' do
      post :upload_proof, params: proof_params

      expect(response).to have_http_status(:ok), response.body
      expect(UploadedFile.sole.user_id).to eq(applicant_web_app_id)
    end

    # Given the applicant's proof and the counselor's own proof for the same preference
    # When the counselor uploads a replacement for the applicant
    # Then the applicant's old proof is replaced and the counselor's own is kept
    it "replaces the applicant's proof, not the counselor's own" do
      same_preference = { listing_id: 'listing123', listing_preference_id: 'pref1' }
      applicant_file =
        create(:uploaded_file, user_id: applicant_web_app_id, **same_preference)
      counselor_file =
        create(:uploaded_file, user_id: 'user_counselor', **same_preference)

      post :upload_proof, params: proof_params

      expect(UploadedFile.exists?(applicant_file.id)).to be(false)
      expect(UploadedFile.exists?(counselor_file.id)).to be(true)
    end

    # Given a counselor with a valid hc_session
    # When they upload a proof
    # Then the applicant's Contact is read from Salesforce once
    it "reads the applicant's Contact once per upload" do
      post :upload_proof, params: proof_params

      expect(Force::AccountService).to have_received(:get)
        .with(applicant_contact_id).once
    end

    # Given the applicant's proof and the counselor's own proof on the same listing
    # When the counselor loads the applicant's application for that listing
    # Then only the applicant's proof is returned
    it "loads only the applicant's proofs" do
      allow(Force::ShortFormService).to receive(:find_listing_application).and_return({})
      applicant_file =
        create(:uploaded_file, user_id: applicant_web_app_id, listing_id: 'listing123')
      create(:uploaded_file, user_id: 'user_counselor', listing_id: 'listing123')

      get :show_listing_application_for_user, params: { listing_id: 'listing123' }

      file_ids = JSON.parse(response.body)['files'].map { |f| f['id'] }
      expect(file_ids).to eq([applicant_file.id])
    end

    # Given an applicant whose Contact has no webAppID
    #   And a guest's proof for the same preference
    # When the counselor uploads a proof
    # Then nothing is stored or deleted, and the HC session ends (fail closed)
    it 'stores and deletes nothing when the applicant has no webAppID' do
      allow(Force::AccountService).to receive(:get)
        .with(applicant_contact_id)
        .and_return('webAppID' => nil, 'housingCounselingAgencyId' => agency_id)
      guest_file = create(:uploaded_file, user_id: nil, listing_id: 'listing123',
                                          listing_preference_id: 'pref1')

      post :upload_proof, params: proof_params

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)).to eq('error' => 'hc_session_ended')
      expect(UploadedFile.pluck(:id)).to eq([guest_file.id])
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
