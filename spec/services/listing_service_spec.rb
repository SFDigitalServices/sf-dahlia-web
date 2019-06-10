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
      Force::ListingService.send :get_listings, ids: listing_ids
    end
  end
  let(:rental_listings) do
    VCR.use_cassette('listings/rental_listings') do
      Force::ListingService.send :get_listings, type: 'rental'
    end
  end
  let(:sale_listings) do
    VCR.use_cassette('listings/sale_listings') do
      Force::ListingService.send :get_listings, type: 'ownership'
    end
  end
  let(:all_listings) do
    VCR.use_cassette('listings/all_listings') do
      Force::ListingService.send :get_listings
    end
  end

  # before do
  #   allow_any_instance_of(Force::Request).to receive(:oauth_token)
  # end

  describe '.listings' do
    it 'should pass type down to Salesforce request for ownership listing' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', type: 'ownership').and_return(sale_listings)
      Force::ListingService.listings(type: 'ownership')
    end
    it 'should pass type down to Salesforce request for rental listings' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', type: 'rental').and_return(rental_listings)
      Force::ListingService.listings(type: 'rental')
    end
    it 'should pass id down to Salesforce request if part of params' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', ids: listing_ids).and_return(listings_by_ids)
      Force::ListingService.listings(ids: listing_ids)
    end
  end

  describe '.raw_listings' do
    it 'should return both rental and ownership listings' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', nil, false).and_return(all_listings)
      Force::ListingService.raw_listings
    end
  end

  describe '.listing' do
    it 'should return details of a listing' do
      p 'listing_id'
      p listing_id
      endpoint = '/ListingDetails/' + listing_id
      p 'endpoint'
      p endpoint
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with(endpoint, nil, false).and_return(single_listing)
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
      expect(eligible_listings.size).to eq(49)
      eligible_listings.each do |listing|
        expect(listing['Tenure']).not_to include('New sale')
        expect(listing['Tenure']).not_to include('Resale')
      end
    end

    it 'returns only ownership listings' do
      allow(Force::ListingService).to receive(:get_listings).and_return(sale_listings)
      sale_filters = filters.merge(type: 'ownership')
      eligible_listings = Force::ListingService.eligible_listings(sale_filters)
      expect(eligible_listings.size).to eq(5)
      eligible_listings.each do |listing|
        expect(listing['Tenure']).not_to include('New rental')
        expect(listing['Tenure']).not_to include('Re-rental')
      end
    end
  end
end
