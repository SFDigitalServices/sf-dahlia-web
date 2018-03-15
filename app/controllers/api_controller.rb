require 'faraday'
# Root controller from which all our API controllers inherit.
class ApiController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  respond_to :json

  rescue_from StandardError do |e|
    render_error(e, status: :service_unavailable, external_capture: true) # 503
  end

  rescue_from Faraday::ClientError do |e|
    if e.is_a?(Faraday::ConnectionFailed) || e.is_a?(Faraday::TimeoutError)
      render_error(e, status: :gateway_timeout, external_capture: true) # 504
    elsif e.message.include? 'APEX_ERROR: System.StringException: Invalid id'
      # listing not found error
      render_error(e, status: :not_found)
    else
      # catch all case
      render_error(e, status: :service_unavailable, external_capture: true)
    end
  end

  def render_error(e, opts = {})
    status = opts[:status] || :internal_server_error
    status_code = Rack::Utils::SYMBOL_TO_STATUS_CODE[status]
    external_capture = opts[:external_capture] || false
    Raven.capture_exception(e) if external_capture
    message = "#{e.class.name}, #{e.message}"
    logger.error "<< API Error >> #{message}"
    render json: { message: message, status: status_code }, status: status
  end
end
