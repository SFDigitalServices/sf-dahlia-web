# spec for short form controller in api/v1
require 'spec_helper'
require 'support/vcr_setup'
require 'support/jasmine'
require 'rails_helper'

describe 'Account API' do
  login_user

  it 'gets my applications' do
    VCR.use_cassette('account/my_applications') do
      get '/api/v1/account/my-applications', params: @auth_headers
    end
    json = JSON.parse(response.body)

    # test for the 200 status-code
    expect(response).to be_successful

    # check to make sure the response data is present
    expect(json['applications']).not_to be_nil
  end

  it 'wraps all requests in with_locale' do
    contact = {
      email: 'test@test.com',
      firstName: 'first',
      lastName: 'last',
    }
    allow(I18n).to receive(:with_locale)
    VCR.use_cassette('account/update') do
      params = @auth_headers.merge(locale: 'es', contact: contact)
      put '/api/v1/account/update', params: params
    end
    expect(I18n).to have_received(:with_locale).with('es')
  end

  describe '#check-account' do
    it 'checks for existing user account by email address' do
      get '/api/v1/account/check-account', params: { email: @user.email }
      json = JSON.parse(response.body)
      expect(response).to be_successful
      expect(json['account_exists']).to eq(true)
    end

    it 'checks for non-existing user account by email address' do
      get '/api/v1/account/check-account', params: { email: 'nobody@not.email' }
      json = JSON.parse(response.body)
      expect(response).to be_successful
      expect(json['account_exists']).to eq(false)
    end
  end
end
