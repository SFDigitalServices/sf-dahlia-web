require 'rails_helper'
require 'webmock/rspec'
require 'restforce'
require 'ostruct'

describe Force::Request do
  let(:oauth_token) { 'a1b2c3d4' }
  let(:client) { instance_double(Restforce::Client) }
  let(:default_response) { OpenStruct.new(body: '') }
  let(:cache) { instance_double(ActiveSupport::Cache::Store) }

  def api_url(endpoint, include_host = false)
    host = include_host ? ENV.fetch('SALESFORCE_INSTANCE_URL', nil) : ''
    host + "/services/apexrest#{endpoint}"
  end

  before do
    allow(Restforce).to receive(:new).and_return(client)
    allow(client).to receive(:options).and_return({})
    allow(client).to receive(:authenticate!)
    allow(Rails).to receive(:cache).and_return(cache)
    allow(cache).to receive(:fetch)
      .with('salesforce_oauth_token', any_args).and_yield
  end

  # includes generic tests for all requests, like retries
  describe '#get' do
    it 'sends a request to Salesforce' do
      endpoint = '/custom'
      params = { test: true }

      expect(client).to receive(:send)
        .with(:get, api_url(endpoint), params).and_return(default_response)

      Force::Request.new.get(endpoint, params)
    end

    it 'retries when receiving an error' do
      endpoint = '/custom'
      retries = 2
      error_class = Faraday::TimeoutError

      expect(client).to(
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

      allow(client).to receive(:send)
        .with(:get, api_url(endpoint), nil).and_raise(error_class)

      # token refreshed on initialization and before each retry
      expect(client).to receive(:authenticate!).exactly(retries + 1).times

      expect do
        Force::Request.new(retries: retries).get(endpoint)
      end.to raise_error(error_class, error_class.name)
    end

    it 'sets timeout for Salesforce request' do
      timeout = 27
      client_params = {
        authentication_retries: 1,
        instance_url: ENV.fetch('SALESFORCE_INSTANCE_URL', nil),
        mashify: false,
        timeout: timeout,
        api_version: ENV.fetch('SALESFORCE_API_VERSION', '61.0'),
      }

      expect(Restforce).to receive(:new)
        .with(client_params).and_return(client)

      Force::Request.new(timeout: timeout)
    end
  end

  describe '#cached_get' do
    let(:endpoint) { '/Listings' }
    let(:params) { { ids: '1,2,3' } }
    let(:cache_key) { endpoint + '?' + params.to_query }

    it 'fetches from the cache' do
      allow(client).to receive(:send)
        .with(:get, api_url(endpoint), params).and_return(default_response)

      expect(cache).to receive(:fetch)
        .with(cache_key, force: true, expires_in: 10.minutes)

      Force::Request.new.cached_get(endpoint, params, true)
    end

    it 'calls through to #get' do
      allow(cache).to receive(:fetch)
        .with(cache_key, force: true, expires_in: 10.minutes).and_yield

      expect(client).to receive(:send)
        .with(:get, api_url(endpoint), params).and_return(default_response)

      Force::Request.new.cached_get(endpoint, params, true)
    end

    it 'doesn\'t recache if false is passed' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('CACHE_SALESFORCE_REQUESTS').and_return('true')
      allow(client).to receive(:send)
        .with(:get, api_url(endpoint), params).and_return(default_response)

      expect(cache).to receive(:fetch)
        .with(cache_key, force: false, expires_in: 10.minutes).and_yield

      Force::Request.new.cached_get(endpoint, params, 'false')
    end
  end

  describe '#post' do
    it 'sends a post request to Salesforce' do
      endpoint = '/shortForm'
      params = { save: true }

      expect(client).to receive(:send)
        .with(:post, api_url(endpoint), params).and_return(default_response)

      Force::Request.new.post(endpoint, params)
    end
  end

  describe '#delete' do
    it 'sends a delete request to Salesforce' do
      endpoint = '/shortForm'
      params = { delete: true }

      expect(client).to receive(:send)
        .with(:delete, api_url(endpoint), params).and_return(default_response)

      Force::Request.new.delete(endpoint, params)
    end
  end

  # stub actual requests so that we can test that Faraday creates
  # correct body and headers
  describe '#post_with_headers' do
    let(:application_id) { 'a0o0P00000HSUgXQAX' }
    let(:endpoint) { "/shortForm/Attachment/#{application_id}" }
    let(:salesforce_url) { api_url(endpoint, true) }

    before do
      # Make sure we have an oauth token to test authorization header
      client.options[:oauth_token] = oauth_token
    end

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

  describe '#oauth_token' do
    it 'fetches an oauth token from the cache' do
      # called once during instantiation and once during method call
      expect(cache).to receive(:fetch)
        .with('salesforce_oauth_token', force: false).twice

      Force::Request.new.oauth_token
    end

    it 'authenticates the client' do
      # called once during instantiation and once during method call
      expect(client).to receive(:authenticate!).twice

      Force::Request.new.oauth_token
    end
  end

  describe '#refresh_oauth_token' do
    it 'force refreshes the cached oauth token' do
      expect(cache).to receive(:fetch)
        .with('salesforce_oauth_token', force: true).once

      Force::Request.new.refresh_oauth_token
    end
  end
end
