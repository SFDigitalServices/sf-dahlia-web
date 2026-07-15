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
      expect(Force::HousingCounselorService).to have_received(:agencies)
    end
  end
end
