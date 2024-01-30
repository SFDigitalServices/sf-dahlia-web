# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Force::ListingService do
  listing_ids = %w[a0W0P00000F8YG4UAN a0W0P00000GwGl3]
  listing_id = 'a0W0P00000F8YG4UAN'
  let(:single_listing) do
    VCR.use_cassette('listings/single_listing') do
      Force::ListingService.send :listing, listing_id
    end
  end
  let(:listings_by_ids) do
    VCR.use_cassette('listings/listings_by_ids') do
      Force::ListingService.send :get_listings, params: { ids: listing_ids }
    end
  end
  let(:rental_listings) do
    VCR.use_cassette('listings/rental_listings') do
      Force::ListingService.send :get_listings, params: { type: 'rental' }
    end
  end
  let(:sale_listings) do
    VCR.use_cassette('listings/sale_listings') do
      Force::ListingService.send :get_listings, params: { type: 'ownership' }
    end
  end
  let(:all_listings_browse) do
    VCR.use_cassette('listings/all_listings_browse') do
      Force::ListingService.send :get_listings
    end
  end

  # before do
  #   allow_any_instance_of(Force::Request).to receive(:oauth_token)
  # end

  describe '.listings' do
    it 'should pass type down to Salesforce request for ownership listing' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails',
              { type: 'ownership', subset: 'browse' }, false, false).and_return(sale_listings)
      Force::ListingService.listings(type: 'ownership')
    end
    it 'should pass type down to Salesforce request for rental listings' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails',
              { type: 'rental', subset: 'browse' }, false, false).and_return(rental_listings)
      Force::ListingService.listings(type: 'rental')
    end
    it 'should pass ids down to Salesforce request if part of params' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', { ids: listing_ids, subset: 'browse' }, false, false)
        .and_return(listings_by_ids)
      Force::ListingService.listings(ids: listing_ids)
    end
    it 'should pass subset down to Salesforce request if part of params' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', { subset: 'browse' }, false, false)
        .and_return(all_listings_browse)
      Force::ListingService.listings
    end
  end

  describe '.listing' do
    it 'should return details of a listing' do
      endpoint = '/ListingDetails/' + listing_id
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with(endpoint, nil, false).and_return([single_listing])
      Force::ListingService.listing(listing_id)
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
      rental_filters = filters.merge(type: 'rental')
      eligible_listings = Force::ListingService.eligible_listings(rental_filters)
      expect(eligible_listings.size).to eq(86)
      eligible_listings.each do |listing|
        expect(listing['Tenure']).not_to include('New sale')
        expect(listing['Tenure']).not_to include('Resale')
      end
    end

    it 'returns only ownership listings' do
      allow(Force::ListingService).to receive(:get_listings).and_return(sale_listings)
      sale_filters = filters.merge(type: 'ownership')
      eligible_listings = Force::ListingService.eligible_listings(sale_filters)
      expect(eligible_listings.size).to eq(72)
      eligible_listings.each do |listing|
        expect(listing['Tenure']).not_to include('New rental')
        expect(listing['Tenure']).not_to include('Re-rental')
      end
    end
  end

  describe '.lottery_buckets' do
    it 'should call right endpoint with forced recache' do
      endpoint = '/Listing/LotteryResult/' + listing_id
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with(endpoint, nil, true).and_return(single_listing)
      Force::ListingService.lottery_buckets(listing_id, force: true)
    end
  end
end
