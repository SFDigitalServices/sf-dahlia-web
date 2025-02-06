require_relative '../../app/constraints/dalp_constraint'
require 'rails_helper'

describe DalpConstraint do
  describe '#matches? listing details page', type: :request do
    let(:single_listing) do
      {
        'Id' => 'test-listing-id',
      }
    end
    let(:request_instance) { instance_double(Force::Request) }
    let(:endpoint) { '/ListingDetails/test-listing-id' }
    before do
      allow(Force::Request).to receive(:new).and_return(request_instance)
      allow(request_instance).to receive(:cached_get)
        .with(endpoint, nil, false)
        .and_return([single_listing])
    end
    it 'navigates to a non-dalp listing' do
      get '/listings/test-listing-id'

      expect(response).to render_template 'layouts/application-react'
    end

    it 'redirects a dalp listing' do
      single_listing['Custom_Listing_Type'] = 'Downpayment Assistance Loan Program'
      get '/listings/test-listing-id'

      expect(response).to redirect_to 'http://www.example.com/'
    end
  end
end
