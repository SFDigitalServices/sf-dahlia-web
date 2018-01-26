# spec for short form controller in api/v1
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'

describe 'Account API' do
  login_user

  ### generate Jasmine fixtures
  describe 'my applications' do
    save_fixture do
      VCR.use_cassette('account/my_applications') do
        get '/api/v1/account/my-applications', {}, @auth_headers
      end
    end
  end

  # ---- end Jasmine fixtures

  it 'gets my applications' do
    VCR.use_cassette('account/my_applications') do
      get '/api/v1/account/my-applications', {}, @auth_headers
    end
    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_success

    # check to make sure the response data is present
    expect(json['applications']).not_to be_nil
  end

  describe '#check-account' do
    it 'checks for existing user account by email address' do
      get '/api/v1/account/check-account', email: @user.email
      json = JSON.parse(response.body)
      expect(response).to be_success
      expect(json['account_exists']).to eq(true)
    end

    it 'checks for non-existing user account by email address' do
      get '/api/v1/account/check-account', email: 'nobody@not.email'
      json = JSON.parse(response.body)
      expect(response).to be_success
      expect(json['account_exists']).to eq(false)
    end
  end
end
