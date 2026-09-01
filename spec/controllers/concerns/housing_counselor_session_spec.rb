require 'rails_helper'

RSpec.describe HousingCounselorSession, type: :controller do
  controller(ApiController) do
    include HousingCounselorSession

    def show
      render json: { session: current_hc_session }
    end

    def write
      write_hc_session_cookie(hc_id: params[:hc_id], app_id: params[:app_id])
      head :ok
    end

    def current_user
      @current_user ||= Struct.new(:salesforce_contact_id).new(params[:signed_in_as])
    end
  end

  before do
    routes.draw do
      get 'show' => 'api#show'
      post 'write' => 'api#write'
    end
  end

  let(:hc_id) { '003_counselor_id' }
  let(:app_id) { '003ABC' }

  def set_hc_session_cookie(hc_id:, app_id:, exp: 2.hours.from_now)
    request.cookies['hc_session'] =
      JsonWebTokenService.encode_token({ 'hcId' => hc_id, 'appId' => app_id }, exp:)
  end

  describe '#write_hc_session_cookie' do
    it 'sets an httponly cookie encoding the given hc and applicant contact IDs' do
      post :write, params: { hc_id:, app_id: }

      expect(cookies[:hc_session]).to be_present
      decoded = JsonWebTokenService.decode_token(cookies[:hc_session])
      expect(decoded).to eq('hcId' => hc_id, 'appId' => app_id)
      expect(response.headers['Set-Cookie']).to include('HttpOnly')
    end
  end

  describe '#current_hc_session' do
    context 'when there is no cookie' do
      it 'returns nil' do
        get :show, params: { signed_in_as: hc_id }

        expect(JSON.parse(response.body)).to eq('session' => nil)
      end
    end

    context 'when the cookie is malformed' do
      before { request.cookies['hc_session'] = 'not-a-jwt' }

      it 'returns nil and discards the cookie' do
        get :show, params: { signed_in_as: hc_id }

        expect(JSON.parse(response.body)).to eq('session' => nil)
        expect(cookies[:hc_session]).to be_blank
      end
    end

    context 'when the cookie is valid and not expired' do
      before { set_hc_session_cookie(hc_id:, app_id:) }

      it 'returns the hc_id and app_id when hcId matches the signed-in user' do
        get :show, params: { signed_in_as: hc_id }

        expect(JSON.parse(response.body)).to eq('session' => { 'hc_id' => hc_id,
                                                               'app_id' => app_id })
      end

      it 'returns nil and discards the cookie when hcId does not match the signed-in ' \
         'user' do
        get :show, params: { signed_in_as: 'someone_else' }

        expect(JSON.parse(response.body)).to eq('session' => nil)
        expect(cookies[:hc_session]).to be_blank
      end
    end

    context 'when the cookie is valid but missing an hcId' do
      before do
        request.cookies['hc_session'] =
          JsonWebTokenService.encode_token({ 'appId' => app_id })
      end

      it 'returns nil and discards the cookie' do
        get :show, params: { signed_in_as: hc_id }

        expect(JSON.parse(response.body)).to eq('session' => nil)
        expect(cookies[:hc_session]).to be_blank
      end
    end

    context 'when the cookie has expired' do
      before { set_hc_session_cookie(hc_id:, app_id:, exp: 1.hour.ago) }

      context 'and the stale cookie hcId does not match the signed-in user' do
        it 'returns nil, discards the cookie, and never calls Salesforce' do
          allow(Force::HousingCounselorService).to receive(:authorize_access)

          get :show, params: { signed_in_as: 'someone_else' }

          expect(JSON.parse(response.body)).to eq('session' => nil)
          expect(cookies[:hc_session]).to be_blank
          expect(Force::HousingCounselorService).not_to have_received(:authorize_access)
        end
      end

      context 'and the stale cookie hcId matches the signed-in user' do
        it 're-authorizes against the applicant encoded in the stale cookie' do
          allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
            { applicant_contact_id: app_id, counselor_contact_id: hc_id },
          )

          get :show, params: { signed_in_as: hc_id }

          expect(Force::HousingCounselorService).to have_received(:authorize_access).with(
            applicant_contact_id: app_id,
            counselor_contact_id: hc_id,
          )
        end

        context 'and Salesforce still grants access' do
          before do
            allow(Force::HousingCounselorService).to receive(:authorize_access)
              .and_return({ applicant_contact_id: app_id, counselor_contact_id: hc_id })
          end

          it 'returns a refreshed session' do
            get :show, params: { signed_in_as: hc_id }

            expect(JSON.parse(response.body)).to eq('session' => { 'hc_id' => hc_id,
                                                                   'app_id' => app_id })
          end

          it 'writes a new, non-expired cookie' do
            get :show, params: { signed_in_as: hc_id }

            expect(cookies[:hc_session]).to be_present
            expect(JsonWebTokenService.decode_token(cookies[:hc_session]))
              .to eq('hcId' => hc_id, 'appId' => app_id)
          end
        end

        context 'and Salesforce no longer grants access' do
          before do
            allow(Force::HousingCounselorService).to receive(:authorize_access)
              .and_return(nil)
          end

          it 'returns nil and discards the cookie' do
            get :show, params: { signed_in_as: hc_id }

            expect(JSON.parse(response.body)).to eq('session' => nil)
            expect(cookies[:hc_session]).to be_blank
          end
        end

        # Regression coverage for a confirmed code-review finding: refresh_hc_session
        # only rescues JsonWebTokenService::InvalidTokenError around the Salesforce
        # re-check. Force::HousingCounselorService#authorize_access itself only
        # rescues Restforce::NotFoundError, so any other error (timeout, other
        # Restforce/Faraday error) is not handled here and propagates out of
        # current_hc_session. In the real HousingCounselorController this reaches
        # ApiController's catch-all rescue_from StandardError, turning what should
        # be a transparent Salesforce re-check into a 500/504 response.
        it 'does not rescue a non-NotFoundError from the Salesforce re-check' do
          allow(Force::HousingCounselorService).to receive(:authorize_access)
            .and_raise(Faraday::TimeoutError, 'timed out')

          get :show, params: { signed_in_as: hc_id }

          expect(response).to have_http_status(:gateway_timeout)
        end
      end
    end
  end
end
