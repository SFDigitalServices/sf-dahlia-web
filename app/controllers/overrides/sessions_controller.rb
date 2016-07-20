module Overrides
  # Overrides to DeviseTokenAuth
  class SessionsController < DeviseTokenAuth::SessionsController
    private

    def render_create_success
      render json: {
        data: resource_data(resource_json: @resource.token_validation_response),
      }
    end
  end
end
