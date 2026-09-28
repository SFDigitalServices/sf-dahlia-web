require 'rails_helper'

describe Overrides::SessionsController, type: :controller do
  let(:password) { 'somepassword1' }
  let!(:user) do
    User.create(
      email: 'jane@doe.com',
      password: password,
      password_confirmation: password,
    )
  end

  before(:each) do
    @request.env['devise.mapping'] = Devise.mappings[:user]
    user.confirm

    stub_const('JsonWebTokenService::SECRET_KEY', 'test_secret')
    stub_const('JsonWebTokenService::ALGORITHM', 'HS256')
    stub_const('JsonWebTokenService::ALLOWED_ALGORITHMS', ['HS256'])
  end

  def set_hc_session_cookie
    cookies['hc_session'] = JsonWebTokenService.encode_token(
      { 'hcId' => '003HC', 'appId' => '003ABC' }, exp: 2.hours.from_now,
    )
  end

  # Regression coverage for req 3: a fresh sign-in should never resume a
  # stale delegated session - the signed-in user should see their own
  # account, not whoever they (or a previous browser user) were last
  # delegated to.
  describe '#create (sign in)' do
    it 'discards an existing hc_session cookie on successful sign-in' do
      set_hc_session_cookie

      post :create, params: { email: user.email, password: password }

      expect(response).to have_http_status(:ok)
      expect(cookies[:hc_session]).to be_blank
    end

    it 'does not error when there is no existing hc_session cookie' do
      post :create, params: { email: user.email, password: password }

      expect(response).to have_http_status(:ok)
    end

    it 'still returns the normal sign-in response body' do
      post :create, params: { email: user.email, password: password }

      expect(JSON.parse(response.body)['data']['email']).to eq(user.email)
    end
  end

  # Regression coverage for req 4: sign-out should end delegation along with
  # everything else, rather than leaving hc_session to outlive the session
  # that granted it.
  describe '#destroy (sign out)' do
    before { request.headers.merge!(user.create_new_auth_token) }

    it 'discards an existing hc_session cookie on sign-out' do
      set_hc_session_cookie

      delete :destroy

      expect(response).to have_http_status(:ok)
      expect(cookies[:hc_session]).to be_blank
    end

    it 'does not error when there is no existing hc_session cookie' do
      delete :destroy

      expect(response).to have_http_status(:ok)
    end
  end
end
