require 'rails_helper'

describe ShortFormService do
  data = JSON.parse(File.read("#{Rails.root}/spec/support/sample-applications.json"))
  apps = data['applications']
  fake_listing_id = 'xyz0001232x'

  describe '#autofill' do
    it 'should pull in details from the most recently submitted application' do
      # autofill for a made-up listing ID
      autofilled = ShortFormService.autofill(apps, fake_listing_id)
      expect(autofilled[:primaryApplicant][:city]).to eq('SAN FRANCISCO')
      expect(autofilled[:alternateContact][:firstName]).to eq('Jim')
      expect(autofilled[:householdMembers].first[:firstName]).to eq('Eleanor')
    end

    it 'should reset details when autofilling application' do
      # autofill for a made-up listing ID
      autofilled = ShortFormService.autofill(apps, fake_listing_id)
      # should pull in alternateContact from most recently submitted application
      expect(autofilled[:id]).to be_nil
      expect(autofilled[:listingID]).to eq(fake_listing_id)
      expect(autofilled[:status]).to eq('Draft')
      expect(autofilled[:answeredCommunityScreening]).to be_nil
      expect(autofilled[:shortFormPreferences]).to eq([])
    end
  end
end
