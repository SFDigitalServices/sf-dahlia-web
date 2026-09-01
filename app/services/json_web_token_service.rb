class JsonWebTokenService
  class InvalidTokenError < StandardError; end
  # Raised only when verify_expiration: true was requested and the token's own
  # exp claim has passed; the signature still verified.
  class ExpiredTokenError < InvalidTokenError; end

  SECRET_KEY = ENV.fetch('JWT_TOKEN_SECRET', nil)
  ALGORITHM = ENV.fetch('JWT_ALGORITHM', nil)
  ALLOWED_ALGORITHMS = [ALGORITHM].compact.freeze

  def self.encode_token(params, exp: nil)
    raise InvalidTokenError, 'JWT is not configured' if SECRET_KEY.blank? || ALGORITHM.blank?

    payload = { data: params }
    payload[:exp] = exp.to_i if exp
    JWT.encode(payload, SECRET_KEY, ALGORITHM)
  end

  # verify_expiration defaults to false because most callers (the HC delegate
  # link, invite-to links) mint tokens with no exp claim, or implement their
  # own deadline check against a field inside `data`, by design. Pass
  # verify_expiration: true for tokens (like the hc_session cookie) whose top
  # level exp claim is the actual source of truth for staleness.
  def self.decode_token(token, verify_expiration: false)
    raise InvalidTokenError, 'Token is blank' if token.blank?
    raise InvalidTokenError, 'JWT is not configured' if SECRET_KEY.blank? || ALGORITHM.blank?

    payload, = JWT.decode(
      token,
      SECRET_KEY,
      true,
      {
        algorithms: ALLOWED_ALGORITHMS,
        verify_expiration:,
      },
    )

    data = payload['data']
    raise InvalidTokenError, 'Invalid JWT payload' unless data.is_a?(Hash)

    Rails.logger.info('JsonWebTokenService#decode_token: Decoded JWT success')
    data
  rescue JWT::ExpiredSignature
    Rails.logger.info('JsonWebTokenService#decode_token: Expired JWT')
    raise ExpiredTokenError, 'Expired JWT'
  rescue JWT::DecodeError => e
    Rails.logger.info("JsonWebTokenService#decode_token: Invalid JWT: #{e.message}")
    raise InvalidTokenError, "Invalid JWT: #{e.message}"
  end
end
