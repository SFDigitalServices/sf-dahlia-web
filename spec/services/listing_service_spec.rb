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

  describe '.listings' do
    it 'should pass type down to Salesforce request for ownership listing' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails',
              { type: 'ownership', subset: 'browse' }, false).and_return(sale_listings)
      Force::ListingService.listings(type: 'ownership')
    end
    it 'should pass type down to Salesforce request for rental listings' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails',
              { type: 'rental', subset: 'browse' }, false).and_return(rental_listings)
      Force::ListingService.listings(type: 'rental')
    end
    it 'should pass ids down to Salesforce request if part of params' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', { ids: listing_ids, subset: 'browse' }, false)
        .and_return(listings_by_ids)
      Force::ListingService.listings(ids: listing_ids)
    end
    it 'should pass subset down to Salesforce request if part of params' do
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with('/ListingDetails', { subset: 'browse' }, false)
        .and_return(all_listings_browse)
      Force::ListingService.listings
    end
  end

  describe '.listing with GoogleCloudTranslate feature flag disabled' do
    it 'should return details of a listing' do
      endpoint = "/ListingDetails/#{listing_id}"
      expect_any_instance_of(Force::Request).to receive(:cached_get)
        .with(endpoint, nil, false).and_return([single_listing])
      Force::ListingService.listing(listing_id)
    end
  end

  describe '.listing with GoogleCloudTranslate feature flag enabled' do
    let(:cache_store) { instance_double(ActiveSupport::Cache::MemoryStore) }
    let(:endpoint) { "/ListingDetails/#{listing_id}" }
    let(:single_listing) do
      { 'Id' => listing_id, 'LastModifiedDate' => '2024-03-08T16:51:35.000+0000' }
    end
    let(:request_instance) { instance_double(Force::Request) }
    let(:cache_service) { instance_double(CacheService) }

    before do
      allow(Rails).to receive(:cache).and_return(cache_store)

      allow(Force::Request).to receive(:new).and_return(request_instance)
      allow(request_instance).to receive(:cached_get).with(endpoint, nil,
                                                           false).and_return([single_listing])
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .with('GoogleCloudTranslate')
        .and_return(true)

      allow(cache_store).to receive(:fetch)
        .with("/ListingDetails/#{listing_id}/translations")
        .and_return({ LastModifiedDate: '2024-03-08T16:51:35.000+0000' })

      allow(CacheService).to receive(:new).and_return(cache_service)

      allow(cache_service).to receive(:process_translations).and_return({ LastModifiedDate: '2024-03-08T16:51:35.000+0000' })
    end
    it 'should return details of a listing with cached listing_translations attached' do
      endpoint = "/ListingDetails/#{listing_id}"
      expect(request_instance).to receive(:cached_get)
        .with(endpoint, nil, false).and_return([single_listing])

      expect(Force::ListingService).to receive(:translations_invalid?).and_return(false)

      expect(cache_store).to receive(:fetch).and_return({ LastModifiedDate: '2024-03-08T16:51:35.000+0000' })

      listing = Force::ListingService.listing(listing_id)
      expect(listing).to have_key('translations')
    end
    it 'should return details of a listing with fresh listing_translations attached' do
      endpoint = "/ListingDetails/#{listing_id}"
      expect(request_instance).to receive(:cached_get)
        .with(endpoint, nil, false).and_return([single_listing])

      expect(Force::ListingService).to receive(:translations_invalid?).and_return(true)

      expect(cache_store).to receive(:fetch).and_return({ LastModifiedDate: '2024-03-08T16:51:35.000+0000' })

      expect(cache_service).to receive(:process_translations).and_return({ LastModifiedDate: '2024-03-08T16:51:35.000+0000' })

      listing = Force::ListingService.listing(listing_id)
      expect(listing).to have_key('translations')
    end

    it 'should return details of a listing with fresh listing_translations attached when translations are outdated' do
      endpoint = "/ListingDetails/#{listing_id}"
      expect(request_instance).to receive(:cached_get)
        .with(endpoint, nil, false).and_return([single_listing])

      expect(Force::ListingService).to receive(:translations_invalid?).and_return(false)

      expect(cache_store).to receive(:fetch).and_return({ LastModifiedDate: '2024-02-08T16:51:35.000+0000' })

      expect(cache_service).to receive(:process_translations).and_return({ LastModifiedDate: '2024-03-08T16:51:35.000+0000' })

      listing = Force::ListingService.listing(listing_id)
      expect(listing).to have_key('translations')
    end

    it 'should return details of a listing with cached listing_translations attached when listing is outdated' do
      endpoint = "/ListingDetails/#{listing_id}"

      expect(Force::ListingService).to receive(:translations_invalid?).and_return(false)

      expect(cache_store).to receive(:fetch).and_return({ LastModifiedDate: '2024-04-08T16:51:35.000+0000' })

      expect(request_instance).to receive(:cached_get)
        .with(endpoint, nil, true).and_return([single_listing])

      listing = Force::ListingService.listing(listing_id)
      expect(listing).to have_key('translations')
    end

    it 'translations_invalid if missing fields' do
      translations_invalid = Force::ListingService.translations_invalid?({})
      expect(translations_invalid).to be_truthy
    end
    it 'translations are valid if all fields are present' do
      translations = {}
      ServiceHelper.listing_field_names_salesforce.each do |field|
        translations[field.to_sym] = 'value'
      end

      translations_invalid = Force::ListingService.translations_invalid?(translations)
      expect(translations_invalid).to be_falsey
    end
    it 'listing_outdated returns true when listing LastModifiedDate is old' do
      listing_is_outdated = Force::ListingService.listing_is_outdated?(
        '2024-03-08T16:51:35.000+0000', '2024-02-08T16:51:35.000+0000'
      )
      expect(listing_is_outdated).to be_truthy
    end
    it 'listing_outdated returns false when listing LastModifiedDate is fresh' do
      listing_is_outdated = Force::ListingService.listing_is_outdated?(
        '2024-03-08T16:51:35.000+0000', '2024-03-08T16:51:35.000+0000'
      )
      expect(listing_is_outdated).to be_falsey
    end
    it 'listing_outdated returns true when listing LastModifiedDate is Nil' do
      listing_is_outdated = Force::ListingService.listing_is_outdated?(nil, nil)
      expect(listing_is_outdated).to be_truthy
    end
    it 'translations_are_outdated returns true when translation LastModifiedDate is old' do
      translations_are_outdated = Force::ListingService.translations_are_outdated?(
        '2024-02-08T16:51:35.000+0000', '2024-03-08T16:51:35.000+0000'
      )
      expect(translations_are_outdated).to be_truthy
    end
    it 'translations_are_outdated returns false when translation LastModifiedDate is fresh' do
      translations_are_outdated = Force::ListingService.translations_are_outdated?(
        '2024-03-08T16:51:35.000+0000', '2024-03-08T16:51:35.000+0000'
      )
      expect(translations_are_outdated).to be_falsey
    end
    it 'translations_are_outdated returns true when translation LastModifiedDate is nil' do
      translations_are_outdated = Force::ListingService.translations_are_outdated?(nil,
                                                                                   nil)
      expect(translations_are_outdated).to be_truthy
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
      expect(eligible_listings.size).to eq(97)
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
