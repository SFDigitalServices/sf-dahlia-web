require 'rails_helper'
require 'webmock/rspec'
require 'restforce'
require 'ostruct'

describe Force::Request do
  let(:oauth_token) { 'a1b2c3d4' }

  def api_url(endpoint, include_host = false)
    host = include_host ? ENV['SALESFORCE_INSTANCE_URL'] : ''
    host + "/services/apexrest#{endpoint}"
  end

  before do
    auth = OpenStruct.new(access_token: oauth_token)
    allow_any_instance_of(Restforce::Client).to receive(:authenticate!).and_return(auth)
  end

  # includes generic tests for all requests, like retries
  describe '#get' do
    it 'sends a request to Salesforce' do
      endpoint = '/custom'
      params = { test: true }
      response = OpenStruct.new(body: '')

      expect_any_instance_of(Restforce::Client).to(
        receive(:send).with(:get, api_url(endpoint), params).and_return(response),
      )

      Force::Request.new.get(endpoint, params)
    end

    it 'retries when receiving an error' do
      endpoint = '/custom'
      retries = 2
      error_class = Faraday::TimeoutError

      expect_any_instance_of(Restforce::Client).to(
        receive(:send).exactly(retries + 1).times.and_raise(error_class),
      )

      expect do
        Force::Request.new(retries: retries).get(endpoint)
      end.to raise_error(error_class, error_class.name)
    end

    it 'refreshes the oauth token for unauthorized errors' do
      endpoint = '/custom'
      retries = 2
      error_class = Restforce::UnauthorizedError
      allow_any_instance_of(Restforce::Client).to receive(:send).and_raise(error_class)
      # token refreshed for initial request and for retries
      expect_any_instance_of(Force::Request).to(
        receive(:refresh_oauth_token).exactly(retries).times,
      )

      expect do
        Force::Request.new(retries: retries).get(endpoint)
      end.to raise_error(error_class, error_class.name)
    end

    it 'sets timeout for Salesforce request' do
      timeout = 27
      restforce_params = {
        authentication_retries: 1,
        oauth_token: oauth_token,
        instance_url: ENV['SALESFORCE_INSTANCE_URL'],
        mashify: false,
        timeout: timeout,
      }

      expect_any_instance_of(Force::Request).to(
        receive(:oauth_token).and_return(oauth_token),
      )
      expect(Restforce).to receive(:new).with(restforce_params)

      Force::Request.new(timeout: timeout)
    end
  end

  describe '#cached_get' do
    it 'fetches from the cache' do
      endpoint = '/Listings'
      params = { ids: '1,2,3' }
      key = endpoint + '?' + params.to_query

      allow_any_instance_of(Force::Request).to(
        receive(:oauth_token).and_return(oauth_token),
      )
      expect(Rails.cache).to(
        receive(:fetch).with(key, force: true, expires_in: 10.minutes),
      )

      Force::Request.new.cached_get(endpoint, params, true)
    end

    it 'calls through to #get' do
      endpoint = '/Listings'
      params = { ids: '1,2,3' }

      expect_any_instance_of(Force::Request).to receive(:get).with(endpoint, params)

      Force::Request.new.cached_get(endpoint, params, true)
    end
  end

  describe '#post' do
    it 'sends a post request to Salesforce' do
      endpoint = '/shortForm'
      params = { save: true }
      response = OpenStruct.new(body: '')

      expect_any_instance_of(Restforce::Client).to(
        receive(:send).with(:post, api_url(endpoint), params).and_return(response),
      )

      Force::Request.new.post(endpoint, params)
    end
  end

  describe '#delete' do
    it 'sends a delete request to Salesforce' do
      endpoint = '/shortForm'
      params = { delete: true }
      response = OpenStruct.new(body: '')

      expect_any_instance_of(Restforce::Client).to(
        receive(:send).with(:delete, api_url(endpoint), params).and_return(response),
      )

      Force::Request.new.delete(endpoint, params)
    end
  end

  describe '#post_with_headers' do
    let(:application_id) { 'a0o0P00000HSUgXQAX' }
    let(:endpoint) { "/shortForm/Attachment/#{application_id}" }
    let(:salesforce_url) { api_url(endpoint, true) }

    it 'adds headers to request' do
      filename = 'proof-file.png'
      file = OpenStruct.new(content_type: 'image/png', document_type: 'Cable bill')
      headers = { Name: filename, 'Content-Type' => file.content_type }
      headers_with_auth = headers.merge(Authorization: "OAuth #{oauth_token}")
      body = {
        fileName: filename,
        DocumentType: file.document_type,
        Body: '1234567890ABCDEFGH',
        ApplicationId: application_id,
        ApplicationMemberID: '918273645',
        ApplicationPreferenceID: '5647382910',
      }

      stub_request(:post, salesforce_url)

      Force::Request.new.post_with_headers(endpoint, body, headers)
      expect(a_request(:post, salesforce_url)
        .with(body: body.to_json, headers: headers_with_auth)).to have_been_made.once
    end

    it 'retries when receiving an error' do
      retries = 2
      error_class = Faraday::TimeoutError

      stub_request(:post, salesforce_url).to_raise(error_class)

      expect do
        Force::Request.new(retries: retries).post_with_headers(endpoint)
      end.to raise_error(error_class, error_class.name)
      expect(a_request(:post, salesforce_url)).to have_been_made.times(retries + 1)
    end

    it 'raises an error for 401 status' do
      # Faraday (rather than Restforce) is needed for custom headers, but
      # doesn't throw an error for 401 status

      stub_request(:post, salesforce_url).to_return(status: 401)

      expect do
        Force::Request.new.post_with_headers(endpoint)
      end.to raise_error(Restforce::UnauthorizedError)
    end
  end
end
