# Root controller from which all our API controllers inherit.
class ApiController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  respond_to :json

  rescue_from StandardError do |e|
    message = "#{e.class.name}, #{e.message}"
    logger.error "<< Error captured >> #{message}"
    render json: { message: message }, status: 503
  end

  rescue_from Faraday::ConnectionFailed,
              Faraday::TimeoutError do |e|
    logger.error "<< Timeout! >> #{e.class.name}, #{e.message}"
    render json: { message: 'timeout' }, status: 504
  end
end
