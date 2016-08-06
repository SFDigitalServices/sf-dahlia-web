# spec/requests/api/v1/listings_spec.rb
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'

describe 'Listings API' do
  ### generate Jasmine fixtures
  describe 'index' do
    save_fixture do
      VCR.use_cassette('listings/listings') do
        get '/api/v1/listings.json'
      end
    end
  end
  describe 'show' do
    save_fixture do
      VCR.use_cassette('listings/a0X210000004afdEAA') do
        get '/api/v1/listings/a0X210000004afdEAA.json'
      end
    end
  end
  describe 'AMI' do
    save_fixture do
      VCR.use_cassette('listings/ami') do
        get '/api/v1/listings/ami.json'
      end
    end
  end
  describe 'units' do
    save_fixture do
      VCR.use_cassette('listings/units') do
        get '/api/v1/listings/a0X210000004afdEAA/units.json'
      end
    end
  end
  describe 'lottery preferences' do
    save_fixture do
      VCR.use_cassette('listings/lottery-preferences') do
        get '/api/v1/listings/lottery-preferences.json'
      end
    end
  end
  describe 'eligibility listings' do
    save_fixture do
      VCR.use_cassette('listings/eligibility') do
        params = {
          eligibility: {
            householdsize: 2,
            incomelevel: 20_000,
            childrenUnder6: 1,
          },
        }
        post '/api/v1/listings/eligibility.json', params
      end
    end
  end
  # TO DO: Convert other listings specs to QA env so this test can pass locally
  describe 'lottery buckets' do
    save_fixture do
      VCR.use_cassette('listings/lottery-buckets') do
        get '/api/v1/listings/a0WU000000BmpBdMAJ/lottery_buckets.json'
      end
    end
  end

  # ---- end Jasmine fixtures

  it 'sends a list of listings' do
    VCR.use_cassette('listings/listings') do
      get '/api/v1/listings.json'
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right amount of listings are returned
    # (based on VCR cassette with 15 listings)
    expect(json['listings'].length).to eq(15)
  end

  it 'sends an individual listing' do
    VCR.use_cassette('listings/a0X210000004afdEAA') do
      get '/api/v1/listings/a0X210000004afdEAA.json'
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right Id is present
    expect(json['listing']['Id']).to eq('a0X210000004afdEAA')
  end

  it 'gets eligibility matches' do
    VCR.use_cassette('listings/eligibility') do
      params = {
        eligibility: {
          householdsize: 2,
          incomelevel: 20_000,
          childrenUnder6: 1,
        },
      }
      post '/api/v1/listings/eligibility.json', params
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the Eligibility_Match param is present
    expect(json['listings'].first['Does_Match']).not_to be_nil
  end

  it 'gets AMI results' do
    VCR.use_cassette('listings/ami') do
      get '/api/v1/listings/ami.json'
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right amount of AMI results are returned
    # (based on VCR cassette with 9 results)
    expect(json['ami'].length).to eq(9)
  end

  it 'gets Lottery Preferences' do
    VCR.use_cassette('listings/lottery-preferences') do
      get '/api/v1/listings/lottery-preferences.json'
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right amount of lottery preferences are returned
    # (based on VCR cassette with 5 results)
    expect(json['lottery_preferences'].length).to eq(5)
  end

  it 'gets Unit results for a Listing' do
    VCR.use_cassette('listings/units') do
      get '/api/v1/listings/a0X210000004afdEAA/units.json'
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right amount of Unit results are returned
    # (based on VCR listing with 2 units)
    expect(json['units'].length).to eq(2)
  end

  # TO DO: Convert other listings specs to QA env so this test can pass locally
  # it 'gets lottery buckets for a Listing' do
  #   VCR.use_cassette('listings/lottery-buckets') do
  #     get '/api/v1/listings/a0WU000000BmpBdMAJ/lottery_buckets.json'
  #   end

  #   json = JSON.parse(response.body)

  #   expect(response).to be_success

  #   expect(json['lottery_buckets']['bucketResults'].length).to eq(5)
  # end
end
