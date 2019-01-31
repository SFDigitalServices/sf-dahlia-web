# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Api::V1::ListingsController do
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
      .with(nil)
      .and_return(listings)
  end

  describe '#index' do
    fit 'returns all 4 listings' do
      get :index
      expect(JSON.parse(response.body)['listings'].size).to eq(4)
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
