# spec/requests/api/v1/listings_spec.rb
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'

describe 'Listings API' do
  listing_id = 'a0W0P00000F8YG4UAN' # Automated Test Listing
  completed_listing_id = 'a0W8H0000014Yo4UAE'

  ### generate Jasmine fixtures
  describe 'index' do
    save_fixture do
      VCR.use_cassette('listings/rental_listings') do
        get '/api/v1/listings.json', params: { type: 'rental', subset: 'browse' }
      end
    end
  end
  describe 'show' do
    save_fixture do
      VCR.use_cassette("listings/#{listing_id}") do
        get "/api/v1/listings/#{listing_id}.json"
      end
    end
  end
  describe 'AMI' do
    save_fixture do
      VCR.use_cassette('listings/ami') do
        params = {
          chartType: %w[Non-HERA HCD/TCAC Non-HERA],
          percent: %w[50 50 60],
          year: %w[2016 2016 2016],
        }
        get '/api/v1/listings/ami.json', params: params
      end
    end
  end
  describe 'units' do
    save_fixture do
      VCR.use_cassette('listings/units') do
        get "/api/v1/listings/#{listing_id}/units.json"
      end
    end
  end
  describe 'eligibility listings' do
    save_fixture do
      VCR.use_cassette('listings/eligibility') do
        params = {
          householdsize: 2,
          incomelevel: 20_000,
          childrenUnder6: 1,
        }
        get '/api/v1/listings/eligibility.json', params: params
      end
    end
  end
  describe 'lottery ranking' do
    save_fixture do
      VCR.use_cassette('listings/lottery-ranking') do
        url = "/api/v1/listings/#{listing_id}/lottery_ranking.json"
        get url, params: { lottery_number: '00042084' }
      end
    end
  end
  describe 'lottery buckets' do
    save_fixture do
      VCR.use_cassette('listings/lottery-buckets') do
        get "/api/v1/listings/#{completed_listing_id}/lottery_buckets.json"
      end
    end
  end
  describe 'listing preferences' do
    save_fixture do
      VCR.use_cassette('listings/preferences') do
        get "/api/v1/listings/#{listing_id}/preferences.json"
      end
    end
  end

  # ---- end Jasmine fixtures

  it 'sends a list of listings' do
    VCR.use_cassette('listings/rental_listings') do
      get '/api/v1/listings.json', params: { type: 'rental', subset: 'browse' }
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_successful

    # check to make sure listings are returned
    expect(json['listings']).not_to be_empty
  end

  it 'sends an individual listing' do
    VCR.use_cassette("listings/#{listing_id}") do
      get "/api/v1/listings/#{listing_id}.json"
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_successful

    # check to make sure the right Id is present
    expect(json['listing']['Id']).to eq(listing_id)
  end

  it 'gets rental eligibility matches' do
    VCR.use_cassette('listings/eligibility/rental') do
      params = {
        householdsize: 2,
        incomelevel: 20_000,
        childrenUnder6: 1,
        listingsType: 'rental',
      }
      get '/api/v1/listings/eligibility.json', params: params
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_successful

    # check to make sure the Eligibility_Match param is present
    expect(json['listings'].first['Does_Match']).not_to be_nil
  end

  it 'gets AMI results' do
    VCR.use_cassette('listings/ami') do
      params = {
        chartType: %w[Non-HERA HCD/TCAC Non-HERA],
        percent: %w[50 50 60],
        year: %w[2016 2016 2016],
      }
      get '/api/v1/listings/ami.json', params: params
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_successful

    # check to make sure the right amount of AMI results are returned
    # (based on VCR cassette with 3 different AMI levels)
    expect(json['ami'].length).to eq(3)
  end

  it 'gets Unit results for a Listing' do
    VCR.use_cassette('listings/units') do
      get "/api/v1/listings/#{listing_id}/units.json"
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_successful

    # check to make sure the right amount of Unit results are returned
    # (based on VCR listing with 1 unit)
    expect(json['units'].length).to eq(1)
  end

  it 'returns lottery ranking for lottery number and listing id' do
    VCR.use_cassette('listings/lottery-ranking') do
      url = "/api/v1/listings/#{listing_id}/lottery_ranking.json"
      get url, params: { lottery_number: '00042084' }
    end

    json = JSON.parse(response.body)

    expect(response).to be_successful

    expect(json['lotteryBuckets'].length).to eq(7)
  end

  it 'gets lottery buckets for a Listing' do
    # require 'pry-byebug';binding.pry
    VCR.use_cassette('listings/lottery-buckets') do
      get "/api/v1/listings/#{completed_listing_id}/lottery_buckets.json"
    end

    json = JSON.parse(response.body)

    expect(response).to be_successful

    expect(json['lotteryBuckets'].length).to eq(9)
  end

  it 'gets lottery preferences for a Listing' do
    VCR.use_cassette('listings/preferences') do
      get "/api/v1/listings/#{listing_id}/preferences.json"
    end

    json = JSON.parse(response.body)

    expect(response).to be_successful

    expect(json['preferences'].length).to eq(6)
  end
end
