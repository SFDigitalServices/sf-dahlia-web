require 'rails_helper'

RSpec.describe Api::V1::AccountController, type: :controller do
  let(:user) { create(:user) }

  before do
    allow(Force::AccountService).to receive(:create_or_update)
    allow(Emailer).to receive_message_chain(:account_update, :deliver_later)
    allow(DahliaBackend::MessageService).to receive(:send_housing_counselor_access)
  end

  describe 'PUT #update' do
    let(:contact_params) { { DOB: '2000-01-01' } }

    before do
      allow(controller).to receive(:current_user).and_return(user)
    end

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

    # Regression coverage for a confirmed code-review finding: #update always
    # writes to current_user's own Salesforce contact, but the account
    # settings form is hydrated from #profile, which returns the delegated
    # applicant's data during an hc_session. Without this guard, an HC
    # submitting that form would silently overwrite their own Salesforce
    # contact with the applicant's data.
    context 'when signed in as an HC with an active hc_session cookie' do
      before do
        request.cookies['hc_session'] = JsonWebTokenService.encode_token(
          { 'hcId' => user.salesforce_contact_id, 'appId' => '003XYZ' },
          exp: 2.hours.from_now,
        )
      end

      it 'returns forbidden and does not perform the update' do
        put :update, params: { contact: contact_params }

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)).to eq('error' => 'forbidden')
        expect(Force::AccountService).not_to have_received(:create_or_update)
        expect(Emailer).not_to have_received(:account_update)
      end
    end
  end

  describe 'PUT #update_housing_counselor' do
    let(:clerk_user_id) { 'user_abc123' }
    let(:contact_id) { user.salesforce_contact_id }
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
      allow(controller).to receive(:clerk).and_return(double(user_id: clerk_user_id))
      allow(ClerkService).to receive(:salesforce_contact_id)
        .with(clerk_user_id)
        .and_return(contact_id)
      allow(Force::AccountService).to receive(:create_or_update).and_return(salesforce_contact)
    end

    context 'when Clerk session is missing' do
      before { allow(controller).to receive(:clerk).and_return(nil) }

      it 'returns unauthorized' do
        put :update_housing_counselor, params: { contact: contact_params }

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('error' => 'Invalid Clerk session')
        expect(Force::AccountService).not_to have_received(:create_or_update)
      end
    end

    context 'when the user has no Salesforce contact ID' do
      before do
        allow(ClerkService).to receive(:salesforce_contact_id)
          .and_raise(StandardError, 'User has no Salesforce contact id')
        allow(Force::AccountService).to receive(:get)
      end

      it 'returns not found' do
        put :update_housing_counselor, params: { contact: contact_params }

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to eq('error' => 'Could not get Salesforce contact ID')
        expect(Force::AccountService).not_to have_received(:create_or_update)
        expect(Force::AccountService).not_to have_received(:get)
        expect(DahliaBackend::MessageService).not_to have_received(:send_housing_counselor_access)
      end
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
          'contactID' => contact_id,
          'webAppID' => clerk_user_id,
        ),
      )
      expect(DahliaBackend::MessageService).to have_received(:send_housing_counselor_access).with(
        housing_counselor_action: 'ACCESS_GRANTED',
        contact_id: contact_id,
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
          'contactID' => contact_id,
        ),
      )
      expect(DahliaBackend::MessageService).to have_received(:send_housing_counselor_access).with(
        housing_counselor_action: 'ACCESS_REVOKED',
        contact_id: contact_id,
        agency_id: '123',
      )
      expect(Emailer).not_to have_received(:account_update)
    end

    context 'when signed in as an HC with an active hc_session cookie' do
      before do
        request.cookies['hc_session'] = JsonWebTokenService.encode_token(
          { 'hcId' => contact_id, 'appId' => '003XYZ' },
          exp: 2.hours.from_now,
        )
      end

      it 'returns forbidden and does not update Salesforce' do
        put :update_housing_counselor, params: { contact: contact_params }

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)).to eq('error' => 'forbidden')
        expect(Force::AccountService).not_to have_received(:create_or_update)
        expect(DahliaBackend::MessageService)
          .not_to have_received(:send_housing_counselor_access)
      end
    end
  end

  describe 'GET #profile' do
    let(:clerk_user_id) { 'user_abc123' }
    let(:contact_id) { '003ABC' }
    let(:salesforce_contact) do
      {
        'email' => 'test@example.com',
        'firstName' => 'Test',
        'lastName' => 'User',
      }
    end

    before do
      allow(controller).to receive(:clerk).and_return(double(user_id: clerk_user_id))
      allow(ClerkService).to receive(:salesforce_contact_id)
        .with(clerk_user_id)
        .and_return(contact_id)
      allow(Force::AccountService).to receive(:get).and_return(salesforce_contact)
    end

    context 'when Clerk session is missing' do
      before { allow(controller).to receive(:clerk).and_return(nil) }

      it 'returns unauthorized' do
        get :profile

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('error' => 'Invalid Clerk session')
        expect(Force::AccountService).not_to have_received(:get)
      end
    end

    context 'when the Salesforce contact exists' do
      it 'returns the account profile' do
        get :profile

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq(
          'success' => true,
          'data' => salesforce_contact.merge(
            'id' => clerk_user_id,
            'uid' => 'test@example.com',
          ),
        )
        expect(Force::AccountService).to have_received(:get).with(
          contact_id,
          { user_token_validation: true },
        )
      end
    end

    context 'when the user has no Salesforce contact ID' do
      before do
        allow(ClerkService).to receive(:salesforce_contact_id)
          .and_raise(StandardError, 'User has no Salesforce contact id')
      end

      it 'returns not found' do
        get :profile

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to eq('error' => 'Could not get Salesforce contact ID')
        expect(Force::AccountService).not_to have_received(:get)
      end
    end

    context 'when Salesforce does not return a contact ID' do
      before { allow(Force::AccountService).to receive(:get).and_return(nil) }

      it 'returns not found' do
        get :profile

        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)).to eq('error' => 'Could not get Salesforce contact ID')
      end
    end

    context 'when signed in as a housing counselor with a valid hc_session cookie' do
      let(:hc_contact_id) { contact_id }
      let(:applicant_contact_id) { '003XYZ' }

      def set_hc_session_cookie(hc_id:, app_id:, exp: 2.hours.from_now)
        request.cookies['hc_session'] =
          JsonWebTokenService.encode_token({ 'hcId' => hc_id, 'appId' => app_id }, exp:)
      end

      it 'returns the delegated applicant profile rather than the housing ' \
         "counselor's own" do
        set_hc_session_cookie(hc_id: hc_contact_id, app_id: applicant_contact_id)

        get :profile

        expect(response).to have_http_status(:ok)
        expect(Force::AccountService).to have_received(:get).with(
          applicant_contact_id,
          { user_token_validation: true },
        )
      end

      context 'and the cookie has expired but Salesforce still grants access' do
        it 'refreshes the cookie via Salesforce and still returns the applicant ' \
           'profile' do
          set_hc_session_cookie(
            hc_id: hc_contact_id, app_id: applicant_contact_id, exp: 1.hour.ago
          )
          allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
            { applicant_contact_id:, counselor_contact_id: hc_contact_id },
          )

          get :profile

          expect(response).to have_http_status(:ok)
          expect(Force::AccountService).to have_received(:get).with(
            applicant_contact_id,
            { user_token_validation: true },
          )
          expect(cookies[:hc_session]).to be_present
        end
      end

      context 'and the cookie has expired and access has since been legitimately ' \
              'revoked' do
        it "falls back to the counselor's own profile" do
          set_hc_session_cookie(
            hc_id: hc_contact_id, app_id: applicant_contact_id, exp: 1.hour.ago
          )
          allow(Force::HousingCounselorService).to receive(:authorize_access)
            .and_return(nil)

          get :profile

          expect(response).to have_http_status(:ok)
          expect(Force::AccountService).to have_received(:get).with(
            hc_contact_id,
            { user_token_validation: true },
          )
          expect(cookies[:hc_session]).to be_blank
        end
      end

      # Regression coverage for a confirmed code-review finding: a transient
      # Salesforce failure while refreshing an expired hc_session cookie used
      # to be silently treated the same as "no hc_session," so profile fell
      # back to showing the housing counselor their own Salesforce contact
      # instead of erroring - a silent identity mix-up. It must now render
      # unauthorized instead of ever falling back in this case.
      context 'and the cookie has expired and Salesforce raises a transient error ' \
              'during the re-check' do
        it 'returns unauthorized rather than silently falling back to the ' \
           "counselor's own profile" do
          set_hc_session_cookie(
            hc_id: hc_contact_id, app_id: applicant_contact_id, exp: 1.hour.ago
          )
          allow(Force::HousingCounselorService).to receive(:authorize_access)
            .and_raise(Faraday::TimeoutError, 'timed out')

          get :profile

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)).to eq('error' => 'unauthorized')
          expect(Force::AccountService).not_to have_received(:get)
          expect(cookies[:hc_session]).to be_blank
        end
      end
    end
  end

  describe 'POST #create_profile' do
    let(:clerk_user_id) { 'user_abc123' }
    let(:contact_params) do
      {
        firstName: 'Test',
        middleName: 'Q',
        lastName: 'User',
        DOB: '2000-01-01',
      }
    end
    let(:salesforce_contact) { { 'contactId' => '003ABC', 'email' => 'test@example.com' } }

    before do
      allow(controller).to receive(:clerk).and_return(double(user_id: clerk_user_id))
      allow(ClerkService).to receive(:email_address)
        .with(clerk_user_id)
        .and_return('test@example.com')
      allow(ClerkService).to receive(:store_salesforce_contact_id)
      allow(Force::AccountService).to receive(:create_or_update).and_return(salesforce_contact)
    end

    context 'when Clerk session is missing' do
      before { allow(controller).to receive(:clerk).and_return(nil) }

      it 'returns unauthorized' do
        post :create_profile, params: { contact: contact_params }

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('error' => 'Invalid Clerk session')
        expect(Force::AccountService).not_to have_received(:create_or_update)
        expect(ClerkService).not_to have_received(:store_salesforce_contact_id)
      end
    end

    context 'when the profile passes validation' do
      it 'creates the Salesforce contact and stores the contact ID' do
        post :create_profile, params: { contact: contact_params }

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq('contact' => salesforce_contact)
        expect(Force::AccountService).to have_received(:create_or_update).with(
          hash_including(
            'firstName' => 'Test',
            'middleName' => 'Q',
            'lastName' => 'User',
            'DOB' => '2000-01-01',
            'email' => 'test@example.com',
            'webAppID' => clerk_user_id,
          ),
        )
        expect(ClerkService).to have_received(:store_salesforce_contact_id).with(
          clerk_user_id,
          '003ABC',
        )
      end
    end

    context 'when DOB is invalid' do
      let(:contact_params) { { firstName: 'Test', lastName: 'User', DOB: '1800-02-03' } }

      it 'returns an error' do
        post :create_profile, params: { contact: contact_params }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to eq('error' => 'User has invalid DOB')
        expect(Force::AccountService).not_to have_received(:create_or_update)
        expect(ClerkService).not_to have_received(:store_salesforce_contact_id)
      end
    end

    context 'when the user has no email' do
      before { allow(ClerkService).to receive(:email_address).and_return(nil) }

      it 'returns an error' do
        post :create_profile, params: { contact: contact_params }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to eq('error' => 'User has missing email')
        expect(Force::AccountService).not_to have_received(:create_or_update)
        expect(ClerkService).not_to have_received(:store_salesforce_contact_id)
      end
    end

    context 'when Salesforce does not return a contact ID' do
      before { allow(Force::AccountService).to receive(:create_or_update).and_return({}) }

      it 'returns a bad gateway error' do
        post :create_profile, params: { contact: contact_params }

        expect(response).to have_http_status(:bad_gateway)
        expect(JSON.parse(response.body)).to eq(
          'error' => 'User has missing Salesforce contact ID',
        )
        expect(ClerkService).not_to have_received(:store_salesforce_contact_id)
      end
    end

    context 'when signed in as an HC with an active hc_session cookie' do
      let(:hc_contact_id) { '003HC' }

      before do
        allow(ClerkService).to receive(:salesforce_contact_id)
          .with(clerk_user_id)
          .and_return(hc_contact_id)
        request.cookies['hc_session'] = JsonWebTokenService.encode_token(
          { 'hcId' => hc_contact_id, 'appId' => '003XYZ' },
          exp: 2.hours.from_now,
        )
      end

      it 'returns forbidden and does not create the profile' do
        post :create_profile, params: { contact: contact_params }

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)).to eq('error' => 'forbidden')
        expect(Force::AccountService).not_to have_received(:create_or_update)
        expect(ClerkService).not_to have_received(:store_salesforce_contact_id)
      end
    end
  end
end
