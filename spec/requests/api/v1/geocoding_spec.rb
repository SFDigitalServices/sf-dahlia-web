# spec/requests/api/v1/listings_spec.rb
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'

describe 'Geocoding API' do
  ### generate Jasmine fixtures
  describe 'valid address' do
    save_fixture do
      VCR.use_cassette('geocoding/valid') do
        params = {
          address: {
            address1: '4053 18th St.',
            city: 'San Francisco',
            zip: '94114',
          },
        }
        post '/api/v1/addresses/geocode.json', params
      end
    end
  end
  describe 'invalid address' do
    save_fixture do
      VCR.use_cassette('geocoding/invalid') do
        params = {
          address: {
            address1: '1299191 Blahblah st.',
            city: 'San Francisco',
            zip: '12345',
          },
        }
        post '/api/v1/addresses/geocode.json', params
      end
    end
  end
  # ---- end Jasmine fixtures

  it 'validates valid address with success == true' do
    VCR.use_cassette('geocoding/valid') do
      params = {
        address: {
          address1: '4053 18th St.',
          city: 'San Francisco',
          zip: '94114',
        },
      }
      post '/api/v1/addresses/geocode.json', params
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the geocoding_data comes back with valid results
    expect(json['geocoding_data']['score']).to eq(100)
  end

  it 'validates invalid address with success == false' do
    VCR.use_cassette('geocoding/invalid') do
      params = {
        address: {
          address1: '1299191 Blahblah st.',
          city: 'San Francisco',
          zip: '12345',
        },
      }
      post '/api/v1/addresses/geocode.json', params
    end

    json = JSON.parse(response.body)

    # still gets a 200 status, but with nil results
    expect(response).to be_success

    # check to make sure geocoding_data is nil for a bad address
    expect(json['geocoding_data']).to eq(nil)
  end
end
