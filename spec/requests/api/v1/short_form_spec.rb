# spec for short form controller in api/v1
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'

describe 'ShortForm API' do
  login_user

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

  describe 'show_application' do
    before do
      Api::V1::ShortFormController.any_instance
                                  .stub(:user_can_access?).and_return(true)
      Api::V1::ShortFormController.any_instance
                                  .stub(:map_listing_to_application)
                                  .and_return(true)
    end

    it 'returns an application object' do
      VCR.use_cassette('shortform/show_application') do
        get '/api/v1/short-form/application/a0tf0000000xw9pAAA.json', {}, @auth_headers
      end
      json = JSON.parse(response.body)
      expect(response).to be_success
      expect(json).not_to be_nil
    end
  end

  describe 'show_listing_application_for_user' do
    before do
      Api::V1::ShortFormController.any_instance
                                  .stub(:find_listing_application).and_return(true)
      Api::V1::ShortFormController.any_instance
                                  .stub(:find_application_files)
                                  .and_return(true)
    end

    it 'returns successful response' do
      url = '/api/v1/short-form/listing-application/a0Wf0000003j03WEAQ.json'
      VCR.use_cassette('shortform/show_application') do
        get url, {}, @auth_headers
      end
      expect(response).to be_success
    end
  end

  # describe 'submit_application' do
  # RSPEC IS CONVERTING THE BOOLEAN TO STRINGS, SALESFORCE REJECTING PARAMS
  #   before do
  #     Api::V1::ShortFormController.any_instance
  #                                 .stub(:attach_files_and_send_confirmation)
  #                                 .and_return(true)
  #     Api::V1::ShortFormController.any_instance
  #                                 .stub(:delete_draft_application)
  #                                 .and_return(true)
  #   end

  #   it 'returns successful response' do
  #     url = '/api/v1/short-form/application'
  #     file = './spec/javascripts/fixtures/json/valid-short-form-example.json'
  #     params = JSON.parse(File.read(file))
  #     p params
  #     p 'JSON PARSE ABOVE'
  #     VCR.use_cassette('shortform/submit_application') do
  #       post url, params, format: :json
  #     end
  #     expect(response).to be_success
  #   end
  # end

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
