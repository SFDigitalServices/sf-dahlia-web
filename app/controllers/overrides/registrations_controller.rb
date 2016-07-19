module Overrides
  # Overrides to DeviseTokenAuth
  class RegistrationsController < DeviseTokenAuth::RegistrationsController
    after_action :sync_with_salesforce, only: [:create, :update]
    AccountService = SalesforceService::AccountService

    private

    def sync_with_salesforce
      salesforce_contact = AccountService.create_or_update(account_params)
      if salesforce_contact['contactId']
        @resource.update_attributes(
          salesforce_contact_id: salesforce_contact['contactId'],
        )
      else
        @resource.destroy
        render_create_error
      end
    end

    def account_params
      params.permit(:firstName, :middleName, :lastName, :DOB, :email)
    end
  end
end
