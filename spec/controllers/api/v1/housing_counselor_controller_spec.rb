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
