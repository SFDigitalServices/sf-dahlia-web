# Root controller from which all our API controllers inherit.
class ApiController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  respond_to :json

  before_action do
    logger.debug '***********'
    logger.debug current_user.inspect
  end
end
