# Log JWKS API failures before Clerk's cache rescues and suppresses them.
module ClerkJwksErrorLogging
  def get_jwks(...)
    super
  rescue Faraday::Error => e
    message = "Clerk JWKS connection error (#{e.class}): #{e.message}"
    Rails.logger.error(message)
    raise
  rescue Clerk::Error, Clerk::Models::Errors::APIError => e
    message = "Clerk JWKS API error: #{ClerkClient.error_diagnostics(e)}"
    Rails.logger.error(message)
    raise
  end
end

Clerk::Jwks.prepend(ClerkJwksErrorLogging)

# Bound middleware JWKS requests so blocked Clerk traffic cannot stall Rails.
module ClerkAuthBoundedRetries
  def sdk
    Clerk::SDK.new(
      timeout_ms: ClerkClient::TIMEOUT_MS,
      retry_config: ClerkClient::RETRY_CONFIG,
    )
  end
end

Clerk::AuthenticateRequest.prepend(ClerkAuthBoundedRetries)
