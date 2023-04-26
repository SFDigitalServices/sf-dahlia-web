module Overrides
  # Overrides to DeviseTokenAuth
  class SessionsController < DeviseTokenAuth::SessionsController
    wrap_parameters format: []

    # def create
    #   # require 'pry-byebug';binding.pry
    #   super
    # end

    private

    def render_create_success
      render json: {
        data: @resource.as_json.merge(salesforce_contact_data),
      }
    end

    def render_create_error_not_confirmed
      unless @resource.valid_password?(resource_params[:password])
        return render_create_error_bad_credentials
      end
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
      I18n.t("devise_token_auth.sessions.#{type}", email: @resource.email) if @resource
    end

    def salesforce_contact_data
      return {} unless @resource.salesforce_contact_id.present?
      Force::AccountService.get(@resource.salesforce_contact_id) || {}
    end
  end
end
