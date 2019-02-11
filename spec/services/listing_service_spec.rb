# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Force::ListingService do
  let(:listings) do
    VCR.use_cassette('listings/listings') do
      listings = Force::ListingService.send :get_listings
      # Because we cannot guarantee what order listings will arrive in, and
      # because we don't want to filter through the entire returned list to
      # find some sale and some rental listings, here we mock the Tenure
      # values on some listings to ensure that we have both sale and rental
      # listings to test on. We plan in the future to have dedicated sale and
      # rental listing Salesforce endpoints, which we can then test separately.
      listings[0]['Tenure'] = 'New rental'
      listings[1]['Tenure'] = 'Re-rental'
      listings[2]['Tenure'] = 'New sale'
      listings[3]['Tenure'] = 'Resale'
      listings.take(4)
    end
  end

  before do
    allow(Force::ListingService)
      .to receive(:get_listings)
      .and_return(listings)
  end

  describe '.listings' do
    context 'with no params passed' do
      it 'returns unfiltered listings' do
        expect(Force::ListingService.listings.size).to eq(4)
      end
    end

    context 'filters by sale' do
      let(:filtered_listings) { Force::ListingService.listings(Tenure: 'sale') }

      it 'returns only sale listings' do
        expect(filtered_listings.all? { |l| l['Tenure'].include? 'sale' }).to be_truthy
      end

      it 'filtered listing size is smaller than all listings' do
        expect(filtered_listings.size < listings.size).to be_truthy
      end
    end

    context 'filters by rental' do
      let(:filtered_listings) { Force::ListingService.listings(Tenure: 'rental') }

      it 'returns only rental listings' do
        expect(filtered_listings.all? { |l| l['Tenure'].include? 'rental' }).to be_truthy
      end

      it 'filtered listing size is smaller than all listings' do
        expect(filtered_listings.size < listings.size).to be_truthy
      end
    end
  end

  describe '.eligible_listings' do
    let(:filters) do
      {
        householdsize: 1,
        incomelevel: 18_000,
        childrenUnder6: 0,
      }
    end

    it 'returns only rental listing' do
      eligible_listings = Force::ListingService.eligible_listings(filters)
      expect(eligible_listings.size).to eq(2)
      eligible_listings.each do |listing|
        expect(listing['Tenure']).not_to include('sale')
      end
    end
  end
end
