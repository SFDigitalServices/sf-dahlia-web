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
            listing_id: 'a0X210000000IMMEA2',
            householdsize: '2',
            incomelevel: 40_000,
          }
          get '/api/v1/validate-household', params
        end
      end
    end
    describe 'not match' do
      save_fixture do
        VCR.use_cassette('shortform/validate_household_not_match') do
          params = {
            listing_id: 'a0X210000000IMMEA2',
            householdsize: '10',
            incomelevel: 10_000,
          }
          get '/api/v1/validate-household', params
        end
      end
    end
  end

  # ---- end Jasmine fixtures
end
