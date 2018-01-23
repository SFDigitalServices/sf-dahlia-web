require 'faraday'
# Root controller from which all our API controllers inherit.
class ApiController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  respond_to :json

  rescue_from StandardError do |e|
    render_error(exception: e, status: :service_unavailable, capture: true) # 503
  end

  rescue_from Faraday::ClientError do |e|
    if e.is_a?(Faraday::ConnectionFailed) || e.is_a?(Faraday::TimeoutError)
      render_error(exception: e, status: :gateway_timeout, capture: true) # 504
    elsif e.message.include? 'APEX_ERROR: System.StringException: Invalid id'
      # listing not found error
      render_error(exception: e, status: :not_found)
    else
      # catch all case
      render_error(exception: e, status: :service_unavailable, capture: true)
    end
  end

  def render_error(opts = {})
    status = opts[:status] || :internal_server_error
    message = 'Not found.'
    if opts[:exception] && opts[:capture]
      e = opts[:exception]
      Raven.capture_exception(e)
      message = "#{e.class.name}, #{e.message}"
    end
    logger.error "<< API Error >> #{message}"
    status_code = Rack::Utils::SYMBOL_TO_STATUS_CODE[status]
    render json: { message: message, status: status_code }, status: status
  end
end
