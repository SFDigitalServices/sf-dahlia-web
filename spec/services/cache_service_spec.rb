require 'rails_helper'
require 'support/vcr_setup'
require 'ostruct'

describe CacheService do
  let(:cached_listings) do
    listings = VCR.use_cassette('listings/all_listings_browse') do
      Force::ListingService.listings()
    end
    # Trim down, we only need one listing for testing
    listings.take(1)
  end

  let(:updated_listings) do
    # map from cached listings to prevent listing properties from
    # being passed by reference (and thus updated in both places)
    updated_listings = cached_listings.map(&:clone)
    updated_listings.first['LastModifiedDate'] = 'Very recent date time'
    updated_listings
  end

  let(:updated_listing) { updated_listings.first }

  let(:updated_listing_id) { updated_listing['Id'] }

  let(:listing_image_service) { instance_double(ListingImageService) }

  before do
    allow(Force::ListingService).to receive(:listings).and_return(cached_listings)
    allow(Force::ListingService).to receive(:listings)
      .with(force: true).and_return(updated_listings)
    allow(Force::ListingService).to receive(:listing)
    allow(Force::ListingService).to receive(:units)
    allow(Force::ListingService).to receive(:preferences)
    allow(Force::ListingService).to receive(:lottery_buckets)
    allow(listing_image_service).to receive(:process_image)
      .and_return(OpenStruct.new(errors: nil))
    allow(ListingImageService).to receive(:new).and_return(listing_image_service)
  end

  shared_examples 'cacher of listings' do
    # expects `prefetch_args` to be a hash of options passed to `prefetch_listings`
    it 'refreshes the listing cache for updated listing' do
      expect(Force::ListingService).to receive(:listing)
        .with(updated_listing_id, force: true)
      expect(Force::ListingService).to receive(:units)
        .with(updated_listing_id, force: true)
      expect(Force::ListingService).to receive(:preferences)
        .with(updated_listing_id, force: true)

      VCR.use_cassette('force/initialize') do
        CacheService.new.prefetch_listings(prefetch_args)
      end
    end

    it 'does not cache lottery buckets if the listing is open' do
      updated_listings.first['Application_Due_Date'] = (Time.now + 7.days).iso8601

      expect(Force::ListingService).not_to receive(:lottery_buckets)

      VCR.use_cassette('force/initialize') do
        CacheService.new.prefetch_listings(prefetch_args)
      end
    end

    it 'does cache lottery buckets if the listing is closed' do
      updated_listings.first['Application_Due_Date'] = (Time.now - 7.days).iso8601

      expect(Force::ListingService).to receive(:lottery_buckets)
        .with(updated_listing_id, force: true)

      VCR.use_cassette('force/initialize') do
        CacheService.new.prefetch_listings(prefetch_args)
      end
    end

    it 'processes an image for the updated listing' do
      expect(listing_image_service).to receive(:process_image)

      VCR.use_cassette('force/initialize') do
        CacheService.new.prefetch_listings(prefetch_args)
      end
    end

    it 'logs image processing errors, if present' do
      errors = ['MultipleListingImageService error: No listing images provided for listing a0W0P00000GlKfBUAV']
      allow(listing_image_service).to receive(:process_image)
        .and_return(OpenStruct.new(errors: errors))

      expect(Rails.logger).to receive(:error).with(errors.join(','))

      VCR.use_cassette('force/initialize') do
        CacheService.new.prefetch_listings(prefetch_args)
      end
    end
  end

  describe '#prefetch_listings' do
    context 'listing is updated' do
      before do
        stub_const('ENV', ENV.to_hash.merge('CACHE_LISTING_IMAGES' => true))
        # simulate an updated listing
        allow(Force::ListingService).to receive(:listings)
          .with(subset: 'browse', force: true).and_return(updated_listings)
      end

      it_behaves_like 'cacher of listings' do
        let(:prefetch_args) { {} }
      end
    end

    context 'listing is not updated' do
      # simulate unchanged listings
      let(:updated_listings) { cached_listings }

      it 'does not refresh the listing cache' do
        expect(Force::ListingService).not_to receive(:listing)
        expect(Force::ListingService).not_to receive(:units)
        expect(Force::ListingService).not_to receive(:preferences)
        expect(Force::ListingService).not_to receive(:lottery_buckets)

        VCR.use_cassette('force/initialize') { CacheService.new.prefetch_listings }
      end
    end
  end

  describe '#prefetch_listings(refresh_all: true)' do
    before do
      stub_const('ENV', ENV.to_hash.merge('CACHE_LISTING_IMAGES' => true))
    end
    # simulate unchanged listings, because these should still get updated
    # when refreshing all
    let(:updated_listings) { cached_listings }

    it_behaves_like 'cacher of listings' do
      let(:prefetch_args) { { refresh_all: true } }
    end
  end
end
