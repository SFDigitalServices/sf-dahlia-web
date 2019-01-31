require 'rails_helper'
require 'support/vcr_setup'

describe Force::ListingService do
  let(:listings) do
    VCR.use_cassette('listings/listings') do
      listings = Force::ListingService.send :get_listings
      listings.take(10)
    end
  end

  before do
    allow(Force::ListingService).to receive(:get_listings).with(nil)
                                                          .and_return(listings)
  end

  describe '.listings' do
    context 'with no params passed' do
      it 'returns unfiltered listings' do
        expect(Force::ListingService.listings.size).to eq(10)
      end
    end

    context 'filters by sale' do
      let(:filtered_listings) { Force::ListingService.listings('Tenure' => 'sale') }

      it 'returns only sales listings' do
        expect(filtered_listings.all? { |l| l['Tenure'].include? 'sale' }).to be_truthy
      end

      it 'filtered listing size is smaller than all listings' do
        expect(filtered_listings.size < listings.size).to be_truthy
      end
    end

    context 'filters by rental' do
      let(:filtered_listings) { Force::ListingService.listings('Tenure' => 'rental') }

      it 'returns only rental listings' do
        expect(filtered_listings.all? { |l| l['Tenure'].include? 'rental' }).to be_truthy
      end

      it 'filtered listing size is smaller than all listings' do
        expect(filtered_listings.size < listings.size).to be_truthy
      end
    end
  end
end
