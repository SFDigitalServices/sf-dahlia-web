# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Force::ListingService do
  let(:rental_listings) do
    VCR.use_cassette('listings/rental_listings') do
      Force::ListingService.send :get_listings, Tenure: 'rental'
    end
  end
  let(:sale_listings) do
    VCR.use_cassette('listings/sale_listings') do
      Force::ListingService.send :get_listings, Tenure: 'sale'
    end
  end

  before do
    allow_any_instance_of(Force::Request).to receive(:oauth_token)
  end

  describe '.listings' do
    it 'should pass Tenure down to Salesforce request for sale listing' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', Tenure: 'sale').and_return([])
      Force::ListingService.listings(Tenure: 'sale')
    end
    it 'should pass Tenure down to Salesforce request' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', Tenure: 'rental').and_return(sale_listings)
      Force::ListingService.listings(Tenure: 'rental')
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

    it 'returns only rental listings' do
      allow(Force::ListingService).to receive(:get_listings).and_return(rental_listings)
      rental_filters = filters.merge(Tenure: 'rental')
      eligible_listings = Force::ListingService.eligible_listings(rental_filters)
      expect(eligible_listings.size).to eq(2)
      eligible_listings.each do |listing|
        expect(listing['Tenure']).not_to include('sale')
      end
    end

    it 'returns only sale listings' do
      allow(Force::ListingService).to receive(:get_listings).and_return(sale_listings)
      sale_filters = filters.merge(Tenure: 'sale')
      eligible_listings = Force::ListingService.eligible_listings(sale_filters)
      expect(eligible_listings.size).to eq(2)
      eligible_listings.each do |listing|
        expect(listing['Tenure']).not_to include('rental')
      end
    end
  end
end
