require 'rails_helper'

RSpec.describe Api::V1::HousingCounselorController, type: :controller do
  let(:user) { create(:user) }
  let(:agencies) do
    [
      { 'id' => '123', 'name' => 'Test Agency A', 'shortName' => 'A' },
      { 'id' => '456', 'name' => 'Test Agency B', 'shortName' => 'B' },
    ]
  end

  before do
    allow(controller).to receive(:current_user).and_return(user)
    allow(Force::HousingCounselorService).to receive(:agencies).and_return(agencies)
  end

  describe 'GET #agencies' do
    it 'returns agencies from HousingCounselorService' do
      get :agencies

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('agencies' => agencies)
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

    it 'returns success when the housing counselor has access to the applicant' do
      allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(
        {
          applicant_contact_id:,
          counselor_contact_id: user.salesforce_contact_id,
        },
      )

      post :access, params: { t: token }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('success' => true)
    end

    it 'returns unauthorized when the JWT is missing contactId' do
      allow(JsonWebTokenService).to receive(:decode_token)
        .with(token).and_return('contactId' => nil)

      post :access, params: { t: token }

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)).to eq('error' => 'unauthorized')
    end

    it 'returns unauthorized when the JWT is invalid' do
      allow(JsonWebTokenService).to receive(:decode_token)
        .and_raise(JsonWebTokenService::InvalidTokenError, 'Invalid JWT')

      post :access, params: { t: token }

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)).to eq('error' => 'unauthorized')
    end

    it 'returns forbidden when the housing counselor does not have access' do
      allow(Force::HousingCounselorService).to receive(:authorize_access).and_return(nil)

      post :access, params: { t: token }

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)).to eq('error' => 'forbidden')
    end
  end
end
