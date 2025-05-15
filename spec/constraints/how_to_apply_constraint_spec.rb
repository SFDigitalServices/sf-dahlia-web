require_relative '../../app/constraints/how_to_apply_constraint'
require 'rails_helper'

describe HowToApplyConstraint do
  describe '#matches? with FCFS enabled', type: :request do
    let(:single_listing) do
      {
        'Id' => 'test-listing-id',
        'LastModifiedDate' => '2024-03-08T16:51:35.000+0000',
        'RecordType' => {
          'Name' => 'Ownership',
        },
        'Listing_Type' => 'First Come, First Served',
        'Accepting_Online_Applications' => true,
        'Status' => 'Active',
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
    it 'navigates to how to apply for a fcfs sales listing' do
      get '/listings/test-listing-id/how-to-apply'

      expect(response).to render_template 'layouts/application-react'
    end

    it 'redirects a rental listing' do
      single_listing['RecordType']['Name'] = 'Rental'
      get '/listings/test-listing-id/how-to-apply'

      expect(response).to redirect_to 'http://www.example.com/listings/test-listing-id'
    end

    it 'redirects if listing is not active' do
      single_listing['Status'] = 'Lease Up'
      single_listing['Accepting_Online_Applications'] = false
      get '/listings/test-listing-id/how-to-apply'

      expect(response).to redirect_to 'http://www.example.com/listings/test-listing-id'
    end
  end
end
