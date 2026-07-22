# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Force::HousingCounselorService do
  describe '.agencies' do
    let(:request_instance) { instance_double(Force::Request) }
    let(:agencies) do
      [
        { 'id' => '123', 'name' => 'Test Agency A', 'shortName' => 'A' },
      ]
    end

    before do
      allow(Force::Request).to receive(:new).and_return(request_instance)
    end

    it 'fetches housing counseling agencies from Salesforce' do
      expect(request_instance)
        .to receive(:cached_get)
        .with('/housingCounselingAgencies/')
        .and_return(agencies)

      expect(described_class.agencies).to eq(agencies)
    end
  end
end
