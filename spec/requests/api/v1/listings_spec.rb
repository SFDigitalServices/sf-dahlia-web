# spec/requests/api/v1/listings_spec.rb
require 'spec_helper'
require 'support/vcr_setup'

describe 'Listings API' do
  it 'sends a list of listings' do
    VCR.use_cassette('listings/listings') do
      get '/api/v1/listings.json'
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right amount of messages are returned
    expect(json['listings'].length).to eq(2)
  end

  it 'sends an individual listing' do
    VCR.use_cassette('listings/a0X210000004afdEAA') do
      get '/api/v1/listings/a0X210000004afdEAA.json'
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right amount of messages are returned
    expect(json['listing']['id']).to eq('a0X210000004afdEAA')
  end
end
