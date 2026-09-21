require 'rails_helper'

RSpec.describe Api::V1::ClerkAuthController, type: :controller do
  let(:clerk_user_id) { 'user_abc123' }

  before do
    allow(controller).to receive(:clerk).and_return(double(user_id: clerk_user_id))
  end

  describe 'POST #devise_token' do
    it 'returns Devise headers for a valid Clerk session' do
      user = create(:user)
      auth_headers = {
        'access-token' => 'test-access-token',
        'client' => 'test-client',
        'uid' => user.uid,
      }
      allow(ClerkDeviseTokenExchangeService).to receive(:exchange!)
        .with(clerk_user_id: clerk_user_id)
        .and_return({ user: user, auth_headers: auth_headers })

      post :devise_token

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(
        'success' => true,
        'data' => {
          'id' => user.id,
          'uid' => user.uid,
        },
      )
      expect(response.headers['access-token']).to eq('test-access-token')
      expect(response.headers['client']).to eq('test-client')
      expect(response.headers['uid']).to eq(user.uid)
    end

    it 'returns unauthorized when Clerk session is missing' do
      allow(controller).to receive(:clerk).and_return(nil)
      allow(ClerkDeviseTokenExchangeService).to receive(:exchange!)

      post :devise_token

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)).to eq('error' => 'Invalid Clerk session')
      expect(ClerkDeviseTokenExchangeService).not_to have_received(:exchange!)
    end

    it 'returns unprocessable entity when Clerk email is missing' do
      allow(ClerkDeviseTokenExchangeService).to receive(:exchange!)
        .and_raise(ClerkDeviseTokenExchangeService::MissingEmailError, 'User has missing email')

      post :devise_token

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)).to eq('error' => 'User has missing email')
    end

    it 'returns conflict when user linkage conflicts' do
      allow(ClerkDeviseTokenExchangeService).to receive(:exchange!)
        .and_raise(
          ClerkDeviseTokenExchangeService::LinkConflictError,
          'Existing account is linked to a different Clerk user',
        )

      post :devise_token

      expect(response).to have_http_status(:conflict)
      expect(JSON.parse(response.body)).to eq(
        'error' => 'Existing account is linked to a different Clerk user',
      )
    end
  end
end
