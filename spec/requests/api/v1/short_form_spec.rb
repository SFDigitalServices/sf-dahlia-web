# spec for short form controller in api/v1
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'

describe 'ShortForm API' do
  login_user
  listing_id = 'a0W0P00000F8YG4UAN' # Automated Test Listing
  application_show_id = 'a0o0P00000FEUwC'

  # WARNING: application will be deleted!
  # Hint: to update this, clone the application whose ID we use for application_show_id
  # and use the id of the cloned app. Do not use any application that has the
  # logged-in user as primary applicant! That can cause a Salesforce
  # "APEX_ERROR: System.NullPointerException: Attempt to de-reference a null object"
  # error when we try to fetch the logged-in user's applications.
  application_delete_id = 'a0o1g000000D1nE'

  # Application must have draft status
  application_update_id = 'a0o0P00000FEUwH'
  application_claim_id = 'a0o0P00000FEUwH'

  ### generate Jasmine fixtures
  describe 'validate_household' do
    describe 'match' do
      save_fixture do
        VCR.use_cassette('shortform/validate_household_match') do
          params = {
            listing_id: listing_id,
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
            listing_id: listing_id,
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
        listing_id: listing_id,
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
    before do
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:attach_files_and_send_confirmation).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:delete_draft_application).and_return(true)
    end

    it 'returns successful response' do
      url = '/api/v1/short-form/application'
      file = './spec/javascripts/fixtures/json/valid-short-form-params.json'
      params = JSON.parse(File.read(file))
      params = clean_json_for_vcr(params)

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
        get(
          "/api/v1/short-form/application/#{application_show_id}.json",
          {},
          @auth_headers,
        )
      end
      json = JSON.parse(response.body)
      expect(response).to be_success
      expect(json).not_to be_nil
    end
  end

  # NOTE: if you want to re-generate the 'delete_application' cassette,
  # you have to find another real application to delete!
  describe 'delete_application' do
    before do
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:user_can_access?).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:submitted?).and_return(false)
    end
    it 'returns success response' do
      VCR.use_cassette('shortform/delete_application') do
        delete(
          "/api/v1/short-form/application/#{application_delete_id}.json",
          {},
          @auth_headers,
        )
      end
      expect(response).to be_success
    end
  end

  describe 'update_application' do
    before do
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:attach_files_and_send_confirmation).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:delete_draft_application).and_return(true)
      allow_any_instance_of(Api::V1::ShortFormController)
        .to receive(:user_can_claim?).and_return(true)
    end

    it 'returns success response' do
      url = "/api/v1/short-form/application/#{application_update_id}"
      file = './spec/javascripts/fixtures/json/valid-short-form-params.json'
      params = JSON.parse(File.read(file))
      params['application']['id'] = application_update_id
      params['application']['status'] = 'Draft'
      params = clean_json_for_vcr(params)

      VCR.use_cassette('shortform/update_application') do
        put url, params, @auth_headers
      end
      expect(response).to be_success
    end

    it 'does not return success response for an unauthorized application' do
      # this application ID does not belong to the "login_user"
      url = '/api/v1/short-form/application/a0o0P0000093KJ0'
      file = './spec/javascripts/fixtures/json/valid-short-form-params.json'
      params = JSON.parse(File.read(file))
      params = clean_json_for_vcr(params)

      VCR.use_cassette('shortform/update_unauthorized_application') do
        put url, params, @auth_headers
      end
      expect(response).not_to be_success
    end
  end

  describe 'claim_submitted_application' do
    # NOTE: this doesn't really test that the user should be *allowed* to claim
    # just that the API call functionally works
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
        url = "/api/v1/short-form/claim-application/#{application_claim_id}.json"
        file = './spec/javascripts/fixtures/json/valid-short-form-params.json'
        params = JSON.parse(File.read(file))
        params['temp_session_id'] = 'xyz123'
        params['application']['id'] = application_claim_id
        params = clean_json_for_vcr(params)
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

# NOTE: because VCR converts the bools->strings (which makes salesforce reject it)
#       we have to strip all bools before submitting/recording cassette
def clean_json_for_vcr(data)
  app = data.clone
  app['application'].delete_if { |_k, v| [true, false].include? v }
  app['application']['primaryApplicant'].delete_if { |_k, v| [true, false].include? v }
  app['application']['householdMembers'].each do |h|
    h.delete_if { |_k, v| [true, false].include? v }
  end
  app
end
