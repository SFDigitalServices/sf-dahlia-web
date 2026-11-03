class ClerkClient
  # Define a specific error class for your application to catch
  class ConnectionError < Faraday::ConnectionFailed; end

  TIMEOUT_MS = 20000 # 20 seconds

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
    Rails.logger.error("Clerk API error (#{e.class}): #{e.message}")
    raise
  end
end
