class JsonWebTokenService
  class InvalidTokenError < StandardError; end

  SECRET_KEY = ENV.fetch('JWT_TOKEN_SECRET', nil)
  ALGORITHM = ENV.fetch('JWT_ALGORITHM', nil)

  def self.encode_token(params)
    JWT.encode(
      { data: params },
      SECRET_KEY,
      ALGORITHM,
    )
  end

  def self.decode_token(token)
    raise InvalidTokenError, 'Token is blank' if token.blank?

    decoded_token = JWT.decode(
      token,
      SECRET_KEY,
      true,
      { algorithm: ALGORITHM, verify_expiration: false },
    )
    Rails.logger.info('JsonWebTokenService#decode_token: Decoded JWT Success')
    decoded_token.first['data']
  rescue JWT::DecodeError => e
    Rails.logger.info("JsonWebTokenService#decode_token: Invalid JWT: #{e.message}")
    raise InvalidTokenError, "Invalid JWT: #{e.message}"
  end
end
