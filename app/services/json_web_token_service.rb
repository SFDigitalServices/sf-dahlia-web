class JsonWebTokenService
  class InvalidTokenError < StandardError; end

  SECRET_KEY = ENV.fetch('JWT_TOKEN_SECRET', nil)
  ALGORITHM = ENV.fetch('JWT_ALGORITHM', nil)
  ALLOWED_ALGORITHMS = [ALGORITHM].compact.freeze

  def self.encode_token(params)
    raise InvalidTokenError, 'JWT is not configured' if SECRET_KEY.blank? || ALGORITHM.blank?

    JWT.encode({ data: params }, SECRET_KEY, ALGORITHM)
  end

  def self.decode_token(token)
    raise InvalidTokenError, 'Token is blank' if token.blank?
    raise InvalidTokenError, 'JWT is not configured' if SECRET_KEY.blank? || ALGORITHM.blank?

    payload, = JWT.decode(
      token,
      SECRET_KEY,
      true,
      {
        algorithms: ALLOWED_ALGORITHMS,
        verify_expiration: false, # kept intentionally; controller uses deadline logic
      },
    )

    data = payload['data']
    raise InvalidTokenError, 'Invalid JWT payload' unless data.is_a?(Hash)

    Rails.logger.info('JsonWebTokenService#decode_token: Decoded JWT success')
    data
  rescue JWT::DecodeError => e
    Rails.logger.info("JsonWebTokenService#decode_token: Invalid JWT: #{e.message}")
    raise InvalidTokenError, "Invalid JWT: #{e.message}"
  end
end
