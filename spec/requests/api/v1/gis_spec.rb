# spec/requests/api/v1/listings_spec.rb
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'

describe 'Gis API' do
  project_id = '2012-021'

  # this address matches both the ADHP boundary and the
  # NRHP boundary for the project ID we're using
  match_address = {
    address1: '1222 Harrison St.',
    city: 'San Francisco',
    zip: '94103',
  }

  # this address does not match the ADHP boundary or the
  # NRHP boundary for the project ID we're using
  non_match_address = {
    address1: '2244 Taraval St.',
    city: 'San Francisco',
    zip: '94116',
  }

  invalid_address = {
    address1: '1299191 Blahblah st.',
    city: 'San Francisco',
    zip: '12345',
  }

  fake_params = {
    address: match_address,
    member: {
      firstName: 'Jane',
      lastName: 'Doe',
      dob: '1980-10-1',
    },
    applicant: {
      firstName: 'Johnny',
      lastName: 'Doe',
      dob: '1980-10-2',
    },
    listing: {
      Id: 'xyzyy123',
      Name: '132 Main St.',
    },
  }

  fake_adhp_params = fake_params.merge(project_id: 'ADHP')
  fake_adhp_non_match_params = fake_adhp_params.clone
  fake_adhp_non_match_params[:address] = non_match_address

  fake_nrhp_params = fake_params.merge(project_id: project_id)
  fake_nrhp_non_match_params = fake_nrhp_params.clone
  fake_nrhp_non_match_params[:address] = non_match_address

  fake_invalid_params = fake_params.clone
  fake_invalid_params[:address] = invalid_address

  ### generate Jasmine fixtures
  describe 'valid address boundary match' do
    save_fixture do
      VCR.use_cassette('gis/adhp_match') do
        post '/api/v1/addresses/gis-data.json', params: fake_adhp_params
      end
    end
  end
  describe 'valid address no boundary match' do
    save_fixture do
      VCR.use_cassette('gis/adhp_non_match') do
        post '/api/v1/addresses/gis-data.json', params: fake_adhp_non_match_params
      end
    end
  end
  describe 'invalid address' do
    save_fixture do
      VCR.use_cassette('gis/invalid') do
        post '/api/v1/addresses/gis-data.json', params: fake_invalid_params
      end
    end
  end
  # ---- end Jasmine fixtures

  describe 'getting GID data for a valid address' do
    before do
      VCR.use_cassette('gis/valid') do
        post '/api/v1/addresses/gis-data.json', params: fake_params
      end
    end

    let(:json) { JSON.parse(response.body) }

    it 'sends a success response' do
      expect(response).to be_successful
    end

    it 'sends valid gis information' do
      expect(json['gis_data']['score']).to eq(100)
    end

    context 'when the listing has neither ADHP nor NRHP' do
      it 'sends a nil boundary match' do
        expect(json['gis_data']['boundary_match']).to eq(nil)
      end
    end

    context 'when the listing has ADHP' do
      context 'when address is within the ADHP boundary' do
        it 'sends a true boundary match' do
          VCR.use_cassette('gis/valid') do
            VCR.use_cassette('gis/adhp_match') do
              post '/api/v1/addresses/gis-data.json', params: fake_adhp_params
            end
          end

          json = JSON.parse(response.body)
          expect(json['gis_data']['boundary_match']).to eq(true)
        end
      end

      context 'when address is not within the ADHP boundary' do
        it 'sends a false boundary match' do
          VCR.use_cassette('gis/adhp_non_match') do
            post '/api/v1/addresses/gis-data.json', params: fake_adhp_non_match_params
          end

          json = JSON.parse(response.body)
          expect(json['gis_data']['boundary_match']).to eq(false)
        end
      end
    end

    context 'when the listing has NRHP' do
      context 'when address is within the NRHP boundary' do
        it 'sends a true boundary match' do
          VCR.use_cassette('gis/valid') do
            VCR.use_cassette('gis/nrhp_match') do
              post '/api/v1/addresses/gis-data.json', params: fake_nrhp_params
            end
          end

          json = JSON.parse(response.body)
          expect(json['gis_data']['boundary_match']).to eq(true)
        end
      end

      context 'address is not within the NRHP boundary' do
        it 'sends a false boundary match' do
          VCR.use_cassette('gis/nrhp_non_match') do
            post '/api/v1/addresses/gis-data.json', params: fake_nrhp_non_match_params
          end

          json = JSON.parse(response.body)
          expect(json['gis_data']['boundary_match']).to eq(false)
        end
      end
    end
  end

  describe 'getting GIS data for an invalid address' do
    before do
      VCR.use_cassette('gis/invalid') do
        post '/api/v1/addresses/gis-data.json', params: fake_invalid_params
      end
    end

    let(:json) { JSON.parse(response.body) }

    it 'sends a success response' do
      expect(response).to be_successful
    end

    it 'sends a nil boundary match' do
      expect(json['gis_data']['boundary_match']).to eq(nil)
    end
  end
end
