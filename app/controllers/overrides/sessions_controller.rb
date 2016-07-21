module Overrides
  # Overrides to DeviseTokenAuth
  class SessionsController < DeviseTokenAuth::SessionsController
    private

    def render_create_success
      data = @resource.token_validation_response
      render json: {
        data: data.merge(salesforce_contact_data),
      }
    end

    def salesforce_contact_data
      return {} unless @resource.salesforce_contact_id.present?
      AccountService.get(@resource.salesforce_contact_id) || {}
    end
  end
end
