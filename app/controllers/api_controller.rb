# Root controller from which all our API controllers inherit.
class ApiController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  respond_to :json

  rescue_from StandardError do |e|
    p "UH OH -- StandardError #{e.message}, #{e.class.name}" if Rails.env.development?
    render json: { error: e.message }, status: 503
  end

  rescue_from Faraday::ConnectionFailed,
              Faraday::TimeoutError,
              Faraday::ClientError do |e|
    render json: { error: e.message }, status: 408
  end
end
