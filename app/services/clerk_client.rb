class ClerkClient
  # Define a specific error class for your application to catch
  class ConnectionError < Faraday::ConnectionFailed; end

  TIMEOUT_MS = 20000 # 20 seconds
  LOGGABLE_ERROR_CODES = %w[api_key_invalid].freeze

  # Build a fail-fast instance of the Clerk SDK
  SDK = Clerk::SDK.new(
    timeout_ms: TIMEOUT_MS,
    retry_config: Clerk::Utils::RetryConfig.new(
      strategy: 'backoff',
      backoff: Clerk::Utils::BackoffStrategy.new(
        initial_interval: 1, max_interval: 1, exponent: 1.0, max_elapsed_time: 1
      ),
      retry_connection_errors: false
    )
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
