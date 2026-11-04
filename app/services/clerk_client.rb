class ClerkClient
  # Define a specific error class for your application to catch
  class ConnectionError < Faraday::ConnectionFailed; end

  # in milliseconds, applies to individual http request
  TIMEOUT_MS = 1000
  # Retry intervals and elapsed time are in milliseconds in clerk-sdk-ruby.
  INITIAL_INTERVAL = 1000
  MAX_INTERVAL = 1000
  # Multiplier used to increase the wait time between retries.
  EXPONENT = 1.0
  MAX_ELAPSED_TIME = 5000
  LOGGABLE_ERROR_CODES = %w[api_key_invalid].freeze

  RETRY_CONFIG = Clerk::Utils::RetryConfig.new(
    strategy: 'backoff',
    backoff: Clerk::Utils::BackoffStrategy.new(
      initial_interval: INITIAL_INTERVAL,
      max_interval: MAX_INTERVAL,
      exponent: EXPONENT,
      max_elapsed_time: MAX_ELAPSED_TIME,
    ),
    retry_connection_errors: false,
  )

  # Build a fail-fast instance of the Clerk SDK
  SDK = Clerk::SDK.new(
    timeout_ms: TIMEOUT_MS,
    retry_config: RETRY_CONFIG,
  )

  def self.execute
    yield(SDK)
  rescue Faraday::ConnectionFailed, Faraday::TimeoutError => e
    # Translate generic network exceptions into a namespace specific to Clerk
    Rails.logger.error("Clerk connection error: #{e.message}")
    raise ConnectionError, "Clerk API is unreachable: #{e.message}"
  rescue StandardError => e
    Rails.logger.error("Clerk API error (#{e.class}): #{error_diagnostics(e)}")
    raise
  end

  def self.error_diagnostics(error)
    status = error.status_code if error.respond_to?(:status_code)
    status ||= error.raw_response&.status if error.respond_to?(:raw_response)
    errors = if error.respond_to?(:errors)
               error.errors
             elsif error.respond_to?(:body)
               JSON.parse(error.body).fetch('errors', [])
             else
               []
             end
    codes = Array(errors).filter_map do |api_error|
      code = api_error.code if api_error.respond_to?(:code)
      code ||= api_error['code'] if api_error.is_a?(Hash)
      code if LOGGABLE_ERROR_CODES.include?(code)
    end.uniq

    "status=#{status || 'unknown'}, codes=#{codes.join(',')}"
  rescue JSON::ParserError, TypeError
    "status=#{status || 'unknown'}, codes="
  end
end
