# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClerkClient do
  describe '.execute' do
    it 'logs when the Clerk API is unreachable' do
      error = Faraday::ConnectionFailed.new('connection refused')
      allow(Rails.logger).to receive(:error)

      expect { described_class.execute { raise error } }
        .to raise_error(described_class::ConnectionError,
                        'Clerk API is unreachable: connection refused')
      expect(Rails.logger).to have_received(:error).with(
        'Clerk connection error: connection refused',
      )
    end

    it 'logs and re-raises Clerk API errors' do
      body = '{"errors":[{"code":"api_key_invalid","message":"sensitive detail"},' \
             '{"code":"unapproved_code"}]}'
      error = Clerk::Models::Errors::APIError.new(
        status_code: 401,
        body: body,
        raw_response: nil,
      )
      allow(Rails.logger).to receive(:error)

      expect { described_class.execute { raise error } }.to raise_error(error)
      expect(Rails.logger).to have_received(:error).with(
        "Clerk API error (#{error.class}): status=401, codes=api_key_invalid",
      )
    end
  end

  describe '.error_diagnostics' do
    it 'extracts allowlisted codes from an errors accessor' do
      api_error = double(code: 'api_key_invalid')
      error = double(status_code: 401, errors: [api_error])

      expect(described_class.error_diagnostics(error)).to eq(
        'status=401, codes=api_key_invalid',
      )
    end

    it 'uses an empty error list when the exception has no error details' do
      error = double(status_code: 401)

      expect(described_class.error_diagnostics(error)).to eq('status=401, codes=')
    end

    it 'handles malformed JSON error bodies' do
      error = double(status_code: 401, body: '{')

      expect(described_class.error_diagnostics(error)).to eq('status=401, codes=')
    end
  end

  describe ClerkJwksErrorLogging do
    it 'logs Clerk JWKS API errors before re-raising them' do
      error = Clerk::Models::Errors::APIError.new(
        status_code: 401,
        body: '{"errors":[{"code":"api_key_invalid","message":"invalid key"}]}',
        raw_response: nil,
      )
      allow(Rails.logger).to receive(:error)
      instrumented_client = Class.new do
        prepend ClerkJwksErrorLogging

        define_method(:get_jwks) { raise error }
      end.new

      expect { instrumented_client.get_jwks }.to raise_error(error)
      expect(Rails.logger).to have_received(:error).with(
        'Clerk JWKS API error: status=401, codes=api_key_invalid',
      )
    end

    it 'logs blocked JWKS requests' do
      error = Faraday::ConnectionFailed.new('connection refused')
      allow(Rails.logger).to receive(:error)
      instrumented_client = Class.new do
        prepend ClerkJwksErrorLogging

        define_method(:get_jwks) { raise error }
      end.new

      expect { instrumented_client.get_jwks }.to raise_error(error)
      expect(Rails.logger).to have_received(:error).with(
        'Clerk JWKS connection error (Faraday::ConnectionFailed): connection refused',
      )
    end
  end

  describe ClerkAuthBoundedRetries do
    it 'gives middleware verification bounded timeout and retry settings' do
      auth_request = Clerk::AuthenticateRequest.new(nil)
      sdk = auth_request.send(:sdk)
      config = sdk.instance_variable_get(:@sdk_configuration)

      expect(sdk).to equal(ClerkClient.sdk)
      expect(config.timeout).to eq(ClerkClient::TIMEOUT_MS / 1000.0)
      expect(config.retry_config).to equal(ClerkClient::RETRY_CONFIG)
      expect(config.retry_config.backoff.initial_interval).to eq(ClerkClient::INITIAL_INTERVAL)
      expect(config.retry_config.backoff.max_interval).to eq(ClerkClient::MAX_INTERVAL)
      expect(config.retry_config.backoff.exponent).to eq(ClerkClient::EXPONENT)
      expect(config.retry_config.backoff.max_elapsed_time).to eq(ClerkClient::MAX_ELAPSED_TIME)
      expect(config.retry_config.retry_connection_errors).to be(false)
    end
  end
end
