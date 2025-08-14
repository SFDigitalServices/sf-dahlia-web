require 'rails_helper'

RSpec.describe DahliaBackend::ApiClient, type: :service do
  let(:api_client) { described_class.new }
  let(:api_url) { 'https://example.com/api' }
  let(:api_key) { 'test-api-key' }
  let(:endpoint) { '/test-endpoint' }
  let(:params) { { key: 'value' } }
  let(:http_response) { instance_double(HTTP::Response, code: 200, body: 'Success') }

  before do
    allow(ENV).to receive(:fetch).with('DAHLIA_API_URL').and_return(api_url)
    allow(ENV).to receive(:fetch).with('DAHLIA_API_KEY').and_return(api_key)
    allow(HTTP).to receive(:headers).and_return(HTTP)
    allow(HTTP).to receive(:timeout).and_return(HTTP)
    allow(HTTP).to receive(:post).and_return(http_response)
    allow(HTTP).to receive(:get).and_return(http_response)
  end

  describe '#api_url' do
    it 'returns the API URL from the environment' do
      expect(api_client.api_url).to eq(api_url)
    end

    it 'logs a warning if the API URL is not set' do
      allow(ENV).to receive(:fetch).with('DAHLIA_API_URL').and_raise(KeyError)
      expect(api_client).to receive(:log_warn).with('DAHLIA_API_URL environment variable not set')
      expect(api_client.api_url).to be_nil
    end
  end

  describe '#api_key' do
    it 'returns the API key from the environment' do
      expect(api_client.api_key).to eq(api_key)
    end

    it 'logs a warning if the API key is not set' do
      allow(ENV).to receive(:fetch).with('DAHLIA_API_KEY').and_raise(KeyError)
      expect(api_client).to receive(:log_warn).with('DAHLIA_API_KEY environment variable not set')
      expect(api_client.api_key).to be_nil
    end
  end

  describe '#timeout' do
    it 'sets the timeout for the HTTP client' do
      headers_double = double('headers')

      expect(HTTP)
        .to receive(:headers)
        .with('x-api-key' => api_key)
        .and_return(headers_double)

      expect(headers_double).to receive(:timeout).with(2)
      api_client.http_client
    end
  end

  describe '#post' do
    it 'sends a POST request and logs success' do
      expect(api_client).to receive(:log_info).with("POST request successful: #{endpoint}")
      response = api_client.post(endpoint, params)
      expect(response).to eq(http_response)
    end

    it 'logs an error if the POST request fails' do
      allow(http_response).to receive(:code).and_return(400)
      allow(http_response).to receive(:body).and_return('Error')
      expect(api_client).to receive(:log_error).with('POST request failed: 400 Error',
                                                     nil)
      response = api_client.post(endpoint, params)
      expect(response).to be_nil
    end

    it 'logs an error if an exception occurs' do
      allow(HTTP).to receive(:post).and_raise(StandardError.new('Test error'))
      expect(api_client).to receive(:log_error).with('POST request error',
                                                     instance_of(StandardError))
      response = api_client.post(endpoint, params)
      expect(response).to be_nil
    end
  end

  describe '#get' do
    it 'sends a GET request and logs success' do
      expect(api_client).to receive(:log_info).with("GET request successful: #{endpoint}")
      response = api_client.get(endpoint, params)
      expect(response).to eq(http_response)
    end

    it 'logs an error if the GET request fails' do
      allow(http_response).to receive(:code).and_return(400)
      allow(http_response).to receive(:body).and_return('Error')
      expect(api_client).to receive(:log_error).with('GET request failed: 400 Error', nil)
      response = api_client.get(endpoint, params)
      expect(response).to be_nil
    end

    it 'logs an error if an exception occurs' do
      allow(HTTP).to receive(:get).and_raise(StandardError.new('Test error'))
      expect(api_client).to receive(:log_error).with('GET request error',
                                                     instance_of(StandardError))
      response = api_client.get(endpoint, params)
      expect(response).to be_nil
    end
  end
end
