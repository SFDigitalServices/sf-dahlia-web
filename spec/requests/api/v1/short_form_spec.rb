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

  describe 'submit_application' do
    # NOTE: to get this one to work we created a cassette that stripped out all bools
    #    because VCR converts the bools->strings, which makes salesforce reject it
    before do
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:attach_files_and_send_confirmation).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:delete_draft_application).and_return(true)
    end

    it 'returns successful response' do
      url = '/api/v1/short-form/application'
      file = './spec/javascripts/fixtures/json/valid-short-form-example.json'
      params = JSON.parse(File.read(file))
      VCR.use_cassette('shortform/submit_application') do
        post url, params, format: :json
      end
      expect(response).to be_success
    end
  end

  describe 'show_application' do
    before do
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:user_can_access?).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:map_listing_to_application).and_return(true)
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

  describe 'delete_application' do
    before do
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:user_can_access?).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:submitted?).and_return(false)
    end
    it 'returns success response' do
      VCR.use_cassette('shortform/delete_application') do
        delete '/api/v1/short-form/application/a0tf0000000xw9pAAA.json', {}, @auth_headers
      end
      expect(response).to be_success
    end
  end

  describe 'update_application' do
    # NOTE: to get this one to work we created a cassette that stripped out all bools
    #    because VCR converts the bools->strings, which makes salesforce reject it
    before do
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:attach_files_and_send_confirmation).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:delete_draft_application).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:user_can_claim?).and_return(true)
    end

    it 'returns success response' do
      url = '/api/v1/short-form/application/a0Wf0000003j03WEAQ'
      file = './spec/javascripts/fixtures/json/valid-short-form-example.json'
      params = JSON.parse(File.read(file))
      VCR.use_cassette('shortform/update_application') do
        put url, params, @auth_headers
      end
      expect(response).to be_success
    end
  end

  describe 'claim_submitted_application' do
    # NOTE: to get this one to work we created a cassette that stripped out all bools
    #    because VCR converts the bools->strings, which makes salesforce reject it
    before do
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:user_can_claim?).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:attach_files_and_send_confirmation).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:delete_draft_application).and_return(true)
    end
    it 'returns success response' do
      VCR.use_cassette('shortform/claim_submitted_application') do
        url = '/api/v1/short-form/claim-application/a0tf0000000xw9pAAA.json'
        file = './spec/javascripts/fixtures/json/valid-short-form-example.json'
        params = JSON.parse(File.read(file))
        put url, params, @auth_headers
      end
      expect(response).to be_success
    end
  end

  describe 'show_listing_application_for_user' do
    before do
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:find_listing_application).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:find_application_files).and_return(true)
    end

    it 'returns successful response' do
      url = '/api/v1/short-form/listing-application/a0Wf0000003j03WEAQ.json'
      VCR.use_cassette('shortform/show_application') do
        get url, {}, @auth_headers
      end
      expect(response).to be_success
    end
  end
end
