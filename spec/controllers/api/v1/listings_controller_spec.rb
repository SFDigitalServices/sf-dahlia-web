# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Api::V1::ListingsController do
  let(:rental_listings) do
    VCR.use_cassette('listings/rental_listings') do
      listings = Force::ListingService.send(:get_listings,
                                            params: { type: 'rental' },
                                            force_recache: false, 
                                            cache_only: false)
      listings.take(4)
    end
  end
  let(:sale_listings) do
    VCR.use_cassette('listings/sale_listings') do
      listings = Force::ListingService.send(:get_listings,
                                            params: { type: 'ownership' },
                                            force_recache: false, 
                                            cache_only: false)
      listings.take(4)
    end
  end

  describe '#index' do
    context 'rental listings' do
      before do
        allow(Force::ListingService)
          .to receive(:get_listings)
          .with(params: { type: 'rental' }, force_recache: false, cache_only: false)
          .and_return(rental_listings)
      end

      it 'returns only rental listings' do
        get :index, params: { type: 'rental' }
        resp = JSON.parse(response.body)['listings']
        expect(resp.all? { |l| l['Tenure'].exclude?('New sale') }).to be_truthy
        expect(resp.all? { |l| l['Tenure'].exclude?('Resale') }).to be_truthy
      end
    end
    context 'sale listings' do
      before do
        allow(Force::ListingService)
          .to receive(:get_listings)
          .with(params: { type: 'ownership' }, force_recache: false, cache_only: false)
          .and_return(sale_listings)
      end

      it 'returns only sale listings' do
        get :index, params: { type: 'ownership' }
        resp = JSON.parse(response.body)['listings']
        expect(resp.all? { |l| l['Tenure'].exclude?('New rental') }).to be_truthy
        expect(resp.all? { |l| l['Tenure'].exclude?('Re-rental') }).to be_truthy
      end
    end
    context 'raises an error' do
      it 'returns 504 for Faraday::ConnectionFailed' do
        allow(Force::ListingService)
          .to(receive(:listings)).with({})
          .and_raise(Faraday::ConnectionFailed, 'Error')
        get :index
        expect(response.status).to eq 504
      end

      it 'returns 503 for StandardError' do
        allow(Force::ListingService)
          .to(receive(:listings)).with({})
          .and_raise(StandardError, 'Error')
        get :index
        expect(response.status).to eq 503
      end

      it 'returns 404 for APEX_ERROR' do
        allow(Force::ListingService)
          .to(receive(:listings)).with({})
          .and_raise(StandardError, 'APEX_ERROR: System.StringException: Invalid id')
        get :index
        expect(response.status).to eq 404
      end
    end
  end
end
