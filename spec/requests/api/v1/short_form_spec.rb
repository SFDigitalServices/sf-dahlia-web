# spec for short form controller in api/v1
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'

describe 'ShortForm API' do
  ### generate Jasmine fixtures
  describe 'validate_household' do
    describe 'match' do
      save_fixture do
        VCR.use_cassette('shortform/validate_household_match') do
          params = {
            listing_id: 'a0WU000000ClNXGMA3',
            eligibility: {
              householdsize: '2',
              incomelevel: 40_000,
            },
          }
          post '/api/v1/short-form/validate-household', params
        end
      end
    end
    describe 'not match' do
      save_fixture do
        VCR.use_cassette('shortform/validate_household_not_match') do
          params = {
            listing_id: 'a0WU000000ClNXGMA3',
            eligibility: {
              householdsize: '10',
              incomelevel: 10_000,
            },
          }
          post '/api/v1/short-form/validate-household', params
        end
      end
    end
  end

  # ---- end Jasmine fixtures

  it 'gets eligibility matches' do
    VCR.use_cassette('shortform/validate_household_match') do
      params = {
        listing_id: 'a0WU000000ClNXGMA3',
        eligibility: {
          householdsize: '2',
          incomelevel: 40_000,
        },
      }
      post '/api/v1/short-form/validate-household', params
    end
    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the response data is present
    expect(json).not_to be_nil
  end
end
