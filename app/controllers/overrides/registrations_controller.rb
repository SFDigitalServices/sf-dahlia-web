module Overrides
  # Overrides to DeviseTokenAuth
  class RegistrationsController < DeviseTokenAuth::RegistrationsController
    after_action :sync_with_salesforce, only: [:create, :update]
    before_action :configure_permitted_parameters, if: :devise_controller?
    AccountService = SalesforceService::AccountService

    private

    def render_create_success
      resource = @resource.as_json
      resource['confirmed_at'] = @resource.confirmed_at
      render json: {
        status: 'success',
        data:   resource,
      }
    end

    def sync_with_salesforce
      return false if @resource.errors.any?
      salesforce_contact = AccountService.create_or_update(account_params)
      if salesforce_contact['contactId']
        @resource.update_attributes(
          salesforce_contact_id: salesforce_contact['contactId'],
        )
      else
        # TODO: Fix this error handling.
        # this doesn't totally work -- render gets called twice
        # also if there was an error we've already sent them the email
        @resource.destroy if params[:action] == 'create'
        render_create_error
      end
    end

    def account_params
      params.permit(:firstName, :middleName, :lastName, :DOB, :email)
    end

    def configure_permitted_parameters
      permitted = devise_parameter_sanitizer.instance_values['permitted']
      permitted[:sign_up] << :temp_session_id
    end
  end
end
