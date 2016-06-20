# Root controller from which all our API controllers inherit.
class ApiController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  respond_to :json
end
