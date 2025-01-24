require 'rails_helper'
require 'json'
require 'ostruct'

describe Force::ShortFormService do
  data = JSON.parse(File.read("#{Rails.root}/spec/support/sample-applications.json"))
  apps = data['applications']
  fake_listing_id = 'xyz0001232x'
  institutions_path = '/spec/javascripts/fixtures/json/short_form-api-' \
                      'lending-institutions.json'
  dalp_institutions_path = '/spec/javascripts/fixtures/json/short_form-api-' \
                           'lending-institutions-dalp.json'
  fake_lending_institutions = JSON.parse(File.read("#{Rails.root}#{institutions_path}"))
  fake_lending_institutions_dalp = JSON.parse(
    File.read("#{Rails.root}#{dalp_institutions_path}"),
  )

  puts fake_lending_institutions_dalp
  describe '.autofill' do
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
      expect(autofilled[:alternateContact][:appMemberId]).to be_nil
    end
  end

  describe '.attach_file' do
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

  describe '.lending_institutions' do
    it 'should return lending institutions' do
      allow(Force::ShortFormService)
        .to receive(:lending_institutions)
        .and_return(fake_lending_institutions)
      VCR.use_cassette('shortform/lending-institutions') do
        expect(Force::ShortFormService.lending_institutions)
          .to eq fake_lending_institutions
      end
    end
  end

  describe '.lending_institutions_dalp' do
    it 'should return dalp lending institutions' do
      VCR.use_cassette('shortform/lending-institutions-dalp') do
        expect(Force::ShortFormService.lending_institutions_dalp)
          .to eq fake_lending_institutions_dalp
      end
    end
  end
end
