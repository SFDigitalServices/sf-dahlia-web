require 'rails_helper'
require 'support/vcr_setup'

describe Api::V1::ListingsController do
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

  describe '#index' do
    fit 'returns all 10 listings' do
      get :index
      expect(JSON.parse(response.body)['listings'].size).to eq(10)
    end

    it 'returns only rental listings' do
      get :index, Tenure: 'rental'
      resp = JSON.parse(response.body)['listings']
      expect(resp.all? { |l| l['Tenure'].include? 'rental' }).to be_truthy
    end

    it 'returns only sale listings' do
      get :index, Tenure: 'sale'
      resp = JSON.parse(response.body)['listings']
      expect(resp.all? { |l| l['Tenure'].include? 'sale' }).to be_truthy
    end
  end
end
