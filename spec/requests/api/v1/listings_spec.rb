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
      VCR.use_cassette('listings/a0W0P00000DYiwiUAD') do
        get '/api/v1/listings/a0W0P00000DYiwiUAD.json'
      end
    end
  end
  describe 'AMI' do
    save_fixture do
      VCR.use_cassette('listings/ami') do
        params = {
          ami: [
            { year: '2016', chartType: 'Non-HERA', percent: '50' },
            { year: '2016', chartType: 'HCD/TCAC', percent: '50' },
            { year: '2016', chartType: 'Non-HERA', percent: '60' },
          ],
        }
        post '/api/v1/listings/ami.json', params
      end
    end
  end
  describe 'units' do
    save_fixture do
      VCR.use_cassette('listings/units') do
        get '/api/v1/listings/a0W0P00000DYiwiUAD/units.json'
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
  describe 'lottery ranking' do
    save_fixture do
      VCR.use_cassette('listings/lottery-ranking') do
        url = '/api/v1/listings/a0W0P00000DYiwiUAD/lottery_ranking.json'
        params = { lottery_number: '00008639' }
        get url, params
      end
    end
  end
  describe 'lottery buckets' do
    save_fixture do
      VCR.use_cassette('listings/lottery-buckets') do
        get '/api/v1/listings/a0W0P00000DYiwiUAD/lottery_buckets.json'
      end
    end
  end
  describe 'listing preferences' do
    save_fixture do
      VCR.use_cassette('listings/preferences') do
        get '/api/v1/listings/a0W0P00000DZTkAUAX/preferences.json'
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

    # check to make sure listings are returned
    expect(json['listings']).not_to be_empty
  end

  it 'sends an individual listing' do
    VCR.use_cassette('listings/a0W0P00000DYiwiUAD') do
      get '/api/v1/listings/a0W0P00000DYiwiUAD.json'
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right Id is present
    expect(json['listing']['Id']).to eq('a0W0P00000DYiwiUAD')
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
      params = {
        ami: [
          { year: '2016', chartType: 'Non-HERA', percent: '50' },
          { year: '2016', chartType: 'HCD/TCAC', percent: '50' },
          { year: '2016', chartType: 'Non-HERA', percent: '60' },
        ],
      }
      post '/api/v1/listings/ami.json', params
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right amount of AMI results are returned
    # (based on VCR cassette with 3 different AMI levels)
    expect(json['ami'].length).to eq(3)
  end

  it 'gets Unit results for a Listing' do
    VCR.use_cassette('listings/units') do
      get '/api/v1/listings/a0W0P00000DYiwiUAD/units.json'
    end

    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the right amount of Unit results are returned
    # (based on VCR listing with 1 unit)
    expect(json['units'].length).to eq(1)
  end

  it 'returns lottery ranking for lottery number and listing id' do
    VCR.use_cassette('listings/lottery-ranking') do
      url = '/api/v1/listings/a0W0P00000DYiwiUAD/lottery_ranking.json'
      params = { lottery_number: '00008639' }
      get url, params
    end

    json = JSON.parse(response.body)

    expect(response).to be_success

    expect(json['lottery_ranking']['applicationResults'].length).to eq(1)
  end

  it 'gets lottery buckets for a Listing' do
    VCR.use_cassette('listings/lottery-buckets') do
      get '/api/v1/listings/a0W0P00000DYiwiUAD/lottery_buckets.json'
    end

    json = JSON.parse(response.body)

    expect(response).to be_success

    expect(json['lottery_buckets']['bucketResults'].length).to eq(5)
  end

  it 'gets lottery preferences for a Listing' do
    VCR.use_cassette('listings/preferences') do
      get '/api/v1/listings/a0W0P00000DZTkAUAX/preferences.json'
    end

    json = JSON.parse(response.body)

    expect(response).to be_success

    expect(json['preferences'].length).to eq(4)
  end
end
