require 'rails_helper'
require 'json'
require 'ostruct'

describe Force::ShortFormService do
  data = JSON.parse(File.read("#{Rails.root}/spec/support/sample-applications.json"))
  apps = data['applications']
  fake_listing_id = 'xyz0001232x'

  describe '#autofill' do
    it 'should pull in details from the most recently submitted application' do
      # autofill for a made-up listing ID
      autofilled = Force::ShortFormService.autofill(apps, fake_listing_id)
      expect(autofilled[:primaryApplicant][:city]).to eq('SAN FRANCISCO')
      expect(autofilled[:alternateContact][:firstName]).to eq('Jim')
      expect(autofilled[:householdMembers].first[:firstName]).to eq('Eleanor')
    end

    it 'should reset details when autofilling application' do
      # autofill for a made-up listing ID
      autofilled = Force::ShortFormService.autofill(apps, fake_listing_id)
      # should pull in alternateContact from most recently submitted application
      expect(autofilled[:id]).to be_nil
      expect(autofilled[:listingID]).to eq(fake_listing_id)
      expect(autofilled[:status]).to eq('Draft')
      expect(autofilled[:answeredCommunityScreening]).to be_nil
      expect(autofilled[:shortFormPreferences]).to eq([])
    end
  end

  describe '#attach_file' do
    it 'should call an api_post with correct body' do
      allow_any_instance_of(Force::Request).to receive(:post_with_headers)
        .and_return(file: 'file')
      allow(Force::ShortFormService).to receive(:_short_form_pref)
        .and_return('ID')
      allow(Base64).to receive(:encode64).and_return('body')

      VCR.use_cassette('force/initialize') do
        application = { 'id' => '1235' }
        file = OpenStruct.new(file: {}, document_type: 'type', content_type: 'type')
        response = Force::ShortFormService.attach_file(application, file, 'filename')
        expect(response).to eq(file: 'file')
      end
    end
  end
end
