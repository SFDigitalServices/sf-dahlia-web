require 'rails_helper'

RSpec.describe Api::V1::HousingCounselorController, type: :controller do
  let(:clerk_user_id) { 'user_abc123' }
  let(:contact_id) { '003_counselor_id' }
  let(:agencies) do
    [
      { 'id' => '123', 'name' => 'Test Agency A', 'shortName' => 'A' },
      { 'id' => '456', 'name' => 'Test Agency B', 'shortName' => 'B' },
    ]
  end

  before do
    stub_const('JsonWebTokenService::SECRET_KEY', 'test_secret')
    stub_const('JsonWebTokenService::ALGORITHM', 'HS256')
    stub_const('JsonWebTokenService::ALLOWED_ALGORITHMS', ['HS256'])

    # The whole feature stays behind an Unleash flag in production (off by
    # default - see spec_helper.rb); turn it on here so the examples below
    # exercise the real behavior. The flag-off behavior itself is covered
    # under 'when the feature flag is disabled'.
    allow(Rails.configuration.unleash).to receive(:is_enabled?)
      .with(HousingCounselorSession::FEATURE_FLAG).and_return(true)

    allow(controller).to receive(:clerk).and_return(double(user_id: clerk_user_id))
    allow(ClerkService).to receive(:salesforce_contact_id)
      .with(clerk_user_id)
      .and_return(contact_id)
    allow(Force::HousingCounselorService).to receive(:agencies).and_return(agencies)
  end

  describe 'GET #agencies' do
    it 'returns agencies from HousingCounselorService' do
      get :agencies

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('agencies' => agencies)
    end
  end

  context 'when the feature flag is disabled' do
    before do
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .with(HousingCounselorSession::FEATURE_FLAG).and_return(false)
    end

    it 'renders not_found for #agencies rather than exposing the endpoint' do
      get :agencies

      expect(response).to have_http_status(:not_found)
      expect(Force::HousingCounselorService).not_to have_received(:agencies)
    end

    it 'renders not_found for #access rather than writing a cookie' do
      post :access, params: { t: 'jwt.token' }

      expect(response).to have_http_status(:not_found)
      expect(cookies[:hc_session]).to be_blank
    end
  end

  describe 'POST #access' do
    let(:token) { 'jwt.token' }
    let(:applicant_contact_id) { '003ABC' }

    before do
      allow(JsonWebTokenService).to receive(:decode_token)
        .with(token).and_return('contactId' => applicant_contact_id)
      allow(Force::HousingCounselorService).to receive(:authorize_access)
    end

    context 'when Clerk session is missing' do
      before { allow(controller).to receive(:clerk).and_return(nil) }

      it 'returns unauthorized' do
        post :access, params: { t: token }

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('error' => 'Missing Clerk user ID')
        expect(Force::HousingCounselorService).not_to have_received(:authorize_access)
      end
    end

    it 'returns success when the housing counselor has access to the applicant' do
      allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
        {
          applicant_contact_id:,
          counselor_contact_id: contact_id,
        },
      )

      post :access, params: { t: token }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('success' => true)
      expect(Force::HousingCounselorService).to have_received(:authorize_access).with(
        applicant_contact_id:,
        counselor_contact_id: contact_id,
      )
    end

    it 'sets an httponly hc_session cookie with the hc and applicant contact IDs' do
      # Outer `before` stubs decode_token for the inbound delegate-link token only;
      # re-stub so the cookie's own JWT still round-trips through the real service.
      allow(JsonWebTokenService).to receive(:decode_token).and_call_original
      allow(JsonWebTokenService).to receive(:decode_token)
        .with(token).and_return('contactId' => applicant_contact_id)
      allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
        {
          applicant_contact_id:,
          counselor_contact_id: contact_id,
        },
      )

      post :access, params: { t: token }

      expect(cookies[:hc_session]).to be_present
      decoded = JsonWebTokenService.decode_token(cookies[:hc_session])
      expect(decoded).to eq('hcId' => contact_id, 'appId' => applicant_contact_id)
      expect(response.headers['Set-Cookie']).to include('HttpOnly')
    end

    it 'returns unauthorized when the JWT is missing contactId' do
      allow(JsonWebTokenService).to receive(:decode_token)
        .with(token).and_return('contactId' => nil)

      post :access, params: { t: token }

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)).to eq('error' => 'unauthorized')
      expect(cookies[:hc_session]).to be_nil
    end

    it 'returns unauthorized when the JWT is invalid' do
      allow(JsonWebTokenService).to receive(:decode_token)
        .and_raise(JsonWebTokenService::InvalidTokenError, 'Invalid JWT')

      post :access, params: { t: token }

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)).to eq('error' => 'unauthorized')
      expect(cookies[:hc_session]).to be_nil
    end

    # Regression coverage for req 1: "hitting a delegation URL should always
    # clear any current HC session" - even one that already exists and even
    # if the link's own JWT turns out to be bad, so a stale cookie can never
    # survive a link click just because the click itself failed.
    it 'discards an existing hc_session cookie even when the JWT itself is invalid' do
      request.cookies['hc_session'] = JsonWebTokenService.encode_token(
        { 'hcId' => contact_id, 'appId' => applicant_contact_id }, exp: 2.hours.from_now,
      )
      allow(JsonWebTokenService).to receive(:decode_token)
        .and_raise(JsonWebTokenService::InvalidTokenError, 'Invalid JWT')

      post :access, params: { t: token }

      expect(response).to have_http_status(:unauthorized)
      expect(cookies[:hc_session]).to be_blank
    end

    it 'returns forbidden when the housing counselor does not have access' do
      allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(nil)

      post :access, params: { t: token }

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)).to eq('error' => 'forbidden')
      expect(cookies[:hc_session]).to be_nil
    end

    context 'with an existing hc_session cookie' do
      before do
        # Let the cookie's own JWT round-trip through the real service; the
        # inbound delegate-link token (`t`) stays stubbed per the outer before.
        allow(JsonWebTokenService).to receive(:decode_token).and_call_original
        allow(JsonWebTokenService).to receive(:decode_token)
          .with(token).and_return('contactId' => applicant_contact_id)
      end

      def set_hc_session_cookie(hc_id:, app_id:, exp: 2.hours.from_now)
        request.cookies['hc_session'] =
          JsonWebTokenService.encode_token({ 'hcId' => hc_id, 'appId' => app_id }, exp:)
      end

      # Regression coverage for req 1/2: a delegate link click must never
      # reuse a cached hc_session, even for the same applicant it already
      # covers - it always clears the existing cookie and re-checks
      # Salesforce fresh, so a just-revoked grant is never masked by a
      # still-cached cookie. (Ordinary protected-page browsing, exercised
      # under 'when the JWT param is absent' below, keeps the reuse
      # optimization - only an explicit link click forces a fresh check.)
      context 'when the cookie already covers the requested applicant and is not expired' do
        before { set_hc_session_cookie(hc_id: contact_id, app_id: applicant_contact_id) }

        it 'still calls Salesforce fresh rather than reusing the cached cookie' do
          allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
            { applicant_contact_id:, counselor_contact_id: contact_id },
          )

          post :access, params: { t: token }

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to eq('success' => true)
          expect(Force::HousingCounselorService).to have_received(:authorize_access).with(
            applicant_contact_id:,
            counselor_contact_id: contact_id,
          )
        end

        it 'discards the cached cookie and returns forbidden, without creating a new ' \
           'one, when access has since been revoked' do
          allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(nil)

          post :access, params: { t: token }

          expect(response).to have_http_status(:forbidden)
          expect(JSON.parse(response.body)).to eq('error' => 'forbidden')
          expect(cookies[:hc_session]).to be_blank
        end
      end

      context 'when the JWT param is absent' do
        it 'returns unauthorized if there is no hc_session cookie either' do
          post :access

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)).to eq('error' => 'unauthorized')
          expect(Force::HousingCounselorService).not_to have_received(:authorize_access)
        end

        it 'returns success using the applicant from a valid hc_session cookie' do
          set_hc_session_cookie(hc_id: contact_id, app_id: applicant_contact_id)

          post :access

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to eq('success' => true)
          expect(Force::HousingCounselorService).not_to have_received(:authorize_access)
        end
      end

      context 'when the cookie is for a different applicant than the one requested' do
        before do
          set_hc_session_cookie(hc_id: contact_id, app_id: '003OLD')
          allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
            { applicant_contact_id:, counselor_contact_id: contact_id },
          )
        end

        it 'still checks Salesforce for the newly requested applicant and overwrites the cookie' do
          post :access, params: { t: token }

          expect(response).to have_http_status(:ok)
          expect(Force::HousingCounselorService).to have_received(:authorize_access).with(
            applicant_contact_id:,
            counselor_contact_id: contact_id,
          )
          expect(JsonWebTokenService.decode_token(cookies[:hc_session]))
            .to eq('hcId' => contact_id, 'appId' => applicant_contact_id)
        end
      end

      context 'when the cookie has expired but Salesforce still grants access' do
        before do
          set_hc_session_cookie(hc_id: contact_id, app_id: applicant_contact_id, exp: 1.hour.ago)
          allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
            { applicant_contact_id:, counselor_contact_id: contact_id },
          )
        end

        it 'refreshes the cookie via a single Salesforce re-check and returns success' do
          post :access, params: { t: token }

          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to eq('success' => true)
          expect(Force::HousingCounselorService).to have_received(:authorize_access).once.with(
            applicant_contact_id:,
            counselor_contact_id: contact_id,
          )
          expect(cookies[:hc_session]).to be_present
        end
      end

      context 'when the cookie has expired and access has since been revoked' do
        before do
          set_hc_session_cookie(hc_id: contact_id, app_id: applicant_contact_id, exp: 1.hour.ago)
          allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(nil)
        end

        it 'discards the cookie and returns unauthorized' do
          post :access

          expect(response).to have_http_status(:unauthorized)
          expect(cookies[:hc_session]).to be_blank
        end
      end

      # A delegate link click discards any existing hc_session up front and
      # always re-verifies fresh (see req 1/2 above), so this exercises
      # exactly one Salesforce call regardless of what the now-irrelevant
      # existing (expired) cookie said.
      context 'when a JWT param is present and the cookie has expired and access has ' \
              'since been revoked' do
        before do
          set_hc_session_cookie(hc_id: contact_id, app_id: applicant_contact_id, exp: 1.hour.ago)
          allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(nil)
        end

        it 'returns forbidden after a single Salesforce re-check' do
          post :access, params: { t: token }

          expect(response).to have_http_status(:forbidden)
          expect(JSON.parse(response.body)).to eq('error' => 'forbidden')
          expect(Force::HousingCounselorService).to have_received(:authorize_access).once.with(
            applicant_contact_id:,
            counselor_contact_id: contact_id,
          )
          expect(cookies[:hc_session]).to be_blank
        end
      end

      context 'when a JWT param is present and the cookie has expired and Salesforce ' \
              'raises a transient error during the re-check' do
        before do
          set_hc_session_cookie(hc_id: contact_id, app_id: applicant_contact_id, exp: 1.hour.ago)
          allow(Force::HousingCounselorService).to receive(:authorize_access)
            .and_raise(Faraday::TimeoutError, 'timed out')
        end

        # Unlike a protected-page revisit (AccountController, or the
        # JWT-param-absent path below), a delegate link click always
        # discards any existing hc_session up front, before attempting the
        # fresh check - so there is nothing left to preserve for a retry
        # here even though the failure is transient (see req 1).
        it 'returns unauthorized after a single Salesforce re-check, without letting ' \
           'the error escape from a second, unrescued call, and does not leave the ' \
           'discarded cookie behind' do
          post :access, params: { t: token }

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)).to eq('error' => 'unauthorized')
          expect(Force::HousingCounselorService).to have_received(:authorize_access).once.with(
            applicant_contact_id:,
            counselor_contact_id: contact_id,
          )
          expect(cookies[:hc_session]).to be_blank
        end
      end

      context 'when the cookie belongs to a different signed-in user' do
        before do
          set_hc_session_cookie(hc_id: 'someone_elses_contact_id', app_id: applicant_contact_id)
          allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
            { applicant_contact_id:, counselor_contact_id: contact_id },
          )
        end

        it 'ignores and discards the foreign cookie, then authorizes normally for the signed-in user' do
          post :access, params: { t: token }

          expect(response).to have_http_status(:ok)
          expect(Force::HousingCounselorService).to have_received(:authorize_access).with(
            applicant_contact_id:,
            counselor_contact_id: contact_id,
          )
          expect(JsonWebTokenService.decode_token(cookies[:hc_session]))
            .to eq('hcId' => contact_id, 'appId' => applicant_contact_id)
        end
      end
    end
  end

  describe 'DELETE #clear_session' do
    def set_hc_session_cookie
      request.cookies['hc_session'] = JsonWebTokenService.encode_token(
        { 'hcId' => contact_id, 'appId' => '003ABC' }, exp: 2.hours.from_now,
      )
    end

    it 'discards an existing hc_session cookie' do
      set_hc_session_cookie

      delete :clear_session

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('success' => true)
      expect(cookies[:hc_session]).to be_blank
    end

    it 'succeeds even when there is no existing cookie' do
      delete :clear_session

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('success' => true)
    end

    # Called from sign-out, where the Clerk session may already be ending -
    # and from a normal sign-in with no Clerk-authenticated request behind
    # it yet - so this must not require Clerk auth.
    it 'works without a Clerk session' do
      allow(controller).to receive(:clerk).and_return(nil)
      set_hc_session_cookie

      delete :clear_session

      expect(response).to have_http_status(:ok)
      expect(cookies[:hc_session]).to be_blank
    end

    it 'works even while the feature flag is disabled' do
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .with(HousingCounselorSession::FEATURE_FLAG).and_return(false)
      set_hc_session_cookie

      delete :clear_session

      expect(response).to have_http_status(:ok)
      expect(cookies[:hc_session]).to be_blank
    end
  end
end
