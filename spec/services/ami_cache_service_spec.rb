require 'rails_helper'
require 'support/vcr_setup'
require 'ostruct'

describe AmiCacheService do
  let(:listings) do
    listings = VCR.use_cassette('listings/all_listings_browse') do
      Force::ListingService.listings
    end
    # Trim down, we only need one listing for testing
    listings.take(1)
  end

  let(:listing) { listings.first }

  let(:listing_id) { listing['Id'] }

  let(:units) do
    units = VCR.use_cassette('ami_cache_service/units') do
      Force::ListingService.units(listings.first['Id'], force: true)
    end
    units
  end

  before do
    allow(Force::ListingService).to receive(:units).and_return(units)
  end

  describe '#cache_ami_chart_data' do
    context 'there are units' do
      it 'recaches ami' do
        expect(Force::ListingService).to receive(:ami).exactly(3).times

        VCR.use_cassette('force/ami_cache_service') do
          AmiCacheService.new.cache_ami_chart_data(units)
        end
      end
    end
  end
end
