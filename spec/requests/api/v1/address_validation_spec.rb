# spec/requests/api/v1/listings_spec.rb
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'

describe 'Address Validation API' do
  ### generate Jasmine fixtures
  describe 'valid address' do
    save_fixture do
      VCR.use_cassette('address_validation/valid') do
        params = {
          address: {
            street1: '4053 18th St.',
            city: 'San Francisco',
            state: 'CA',
            zip: '94114',
          },
        }
        post '/api/v1/addresses/validate.json', params: params
      end
    end
  end
  describe 'invalid address' do
    save_fixture do
      VCR.use_cassette('address_validation/invalid') do
        params = {
          address: {
            street1: '1299191 Blahblah st.',
            city: 'San Francisco',
            state: 'CA',
            zip: '12345',
          },
        }
        post '/api/v1/addresses/validate.json', params: params
      end
    end
  end

  describe 'valid PO Box' do
    save_fixture do
      VCR.use_cassette('address_validation/po_box_valid') do
        params = {
          address: {
            street1: 'P.O. Box 37176',
            city: 'San Francisco',
            state: 'CA',
            zip: '94137',
          },
        }
        post '/api/v1/addresses/validate.json', params: params
      end
    end
  end

  # ---- end Jasmine fixtures

  it 'validates valid address with success == true' do
    VCR.use_cassette('address_validation/valid') do
      params = {
        address: {
          street1: '4053 18th St.',
          city: 'San Francisco',
          state: 'CA',
          zip: '94114',
        },
      }
      post '/api/v1/addresses/validate.json', params: params
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_successful

    # check to make sure the delivery verification == 'success'
    expect(json['address']['verifications']['delivery']['success']).to eq(true)
  end

  it 'validates invalid address with success == false' do
    VCR.use_cassette('address_validation/invalid') do
      params = {
        address: {
          street1: '1299191 Blahblah st.',
          city: 'San Francisco',
          state: 'CA',
          zip: '12345',
        },
      }
      post '/api/v1/addresses/validate.json', params: params
    end

    json = JSON.parse(response.body)

    # test for the 422 error status
    expect(response.status).to eq(422)

    # check to make sure the delivery verification is not 'success'
    expect(json['address']['verifications']['delivery']['success']).to eq(false)
  end

  it 'raises an error for valid PO Boxes' do
    VCR.use_cassette('address_validation/po_box_valid') do
      params = {
        address: {
          street1: 'P.O. Box 37176',
          city: 'San Francisco',
          state: 'CA',
          zip: '94137',
        },
      }
      post '/api/v1/addresses/validate.json', params: params
    end

    json = JSON.parse(response.body)
    # test for the 422 error status
    expect(response.status).to eq(422)
    expect(json['error']).to eq('PO BOX')
  end

  it 'raises an error for invalid PO Boxes' do
    VCR.use_cassette('address_validation/po_box_invalid') do
      params = {
        address: {
          street1: 'P.O. Box 123',
          city: 'San Francisco',
          state: 'CA',
          zip: '94137',
        },
      }
      post '/api/v1/addresses/validate.json', params: params
    end

    json = JSON.parse(response.body)
    # test for the 422 error status
    expect(response.status).to eq(422)
    expect(json['error']).to eq('PO BOX')
  end

  describe 'EasyPost error fallback' do
    let(:mock_client) { instance_double(EasyPost::Client) }
    let(:mock_address_service) { double('address_service') }

    before do
      allow(EasyPost::Client).to receive(:new).and_return(mock_client)
      allow(mock_client).to receive(:address).and_return(mock_address_service)
      allow(mock_address_service).to receive(:create).and_raise(
        EasyPost::Errors::EasyPostError.new('Service unavailable'),
      )
    end

    it 'returns 200 with the original address when EasyPost raises an error' do
      params = {
        address: {
          street1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
        },
      }
      post '/api/v1/addresses/validate.json', params: params

      json = JSON.parse(response.body)
      expect(response).to be_successful
      expect(json['address']['street1']).to eq('123 Main St')
      expect(json['address']['city']).to eq('San Francisco')
      expect(json['error']).to be_nil
    end

    it 'does not include verify params in the returned address' do
      params = {
        address: {
          street1: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
        },
      }
      post '/api/v1/addresses/validate.json', params: params

      json = JSON.parse(response.body)
      expect(response).to be_successful
      expect(json['address']).not_to have_key('verify')
    end
  end
end
