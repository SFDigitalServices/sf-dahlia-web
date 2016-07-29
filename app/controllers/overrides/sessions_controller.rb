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

    def render_create_error_not_confirmed
      render_error_json('not_confirmed')
    end

    def render_create_error_bad_credentials
      render_error_json('bad_credentials')
    end

    def render_error_json(type)
      render json: {
        success: false,
        error: type,
        email: @resource ? @resource.email : nil,
        errors: [error_message(type)],
      }, status: 401
    end

    def error_message(type)
      opts = {}
      opts[:email] = @resource.email if @resource
      I18n.t("devise_token_auth.sessions.#{type}", opts)
    end

    def salesforce_contact_data
      return {} unless @resource.salesforce_contact_id.present?
      AccountService.get(@resource.salesforce_contact_id) || {}
    end
  end
end
