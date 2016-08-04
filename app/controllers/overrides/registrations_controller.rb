module Overrides
  # Overrides to DeviseTokenAuth
  class RegistrationsController < DeviseTokenAuth::RegistrationsController
    after_action :sync_with_salesforce, only: [:update]
    AccountService = SalesforceService::AccountService

    # method copied from original gem; refactored to please Rubocop
    def create
      setup_resource_for_create
      if resource_class.devise_modules.include?(:confirmable) && !@redirect_url
        return render_create_error_missing_confirm_success_url
      end

      # if whitelist is set, validate redirect_url against whitelist
      if DeviseTokenAuth.redirect_whitelist
        unless DeviseTokenAuth.redirect_whitelist.include?(@redirect_url)
          return render_create_error_redirect_url_not_allowed
        end
      end

      begin
        # override email confirmation, must be sent manually from ctrl
        resource_class.set_callback('create',
                                    :after,
                                    :send_on_create_confirmation_instructions)
        resource_class.skip_callback('create',
                                     :after,
                                     :send_on_create_confirmation_instructions)
        save_and_render_resource
      rescue ActiveRecord::RecordNotUnique
        clean_up_passwords @resource
        render_create_error_email_already_exists
      end
    end

    private

    def error_checks_for_create
      # success redirect url is required
    end

    def setup_resource_for_create
      @resource            = resource_class.new(sign_up_params)
      @resource.provider   = 'email'

      # honor devise configuration for case_insensitive_keys
      @resource.email = if resource_class.case_insensitive_keys.include?(:email)
                          sign_up_params[:email].try :downcase
                        else
                          @resource.email = sign_up_params[:email]
                        end

      # give redirect value from params priority
      @redirect_url = params[:confirm_success_url]

      # fall back to default value if provided
      @redirect_url ||= DeviseTokenAuth.default_confirm_success_url
    end

    def handle_registration_success
      if !@resource.confirmed?
        # user will require email authentication
        @resource.send_confirmation_instructions(
          client_config: params[:config_name],
          redirect_url: @redirect_url,
        )
      else
        # email auth has been bypassed, authenticate user
        @client_id = SecureRandom.urlsafe_base64(nil, false)
        @token     = SecureRandom.urlsafe_base64(nil, false)

        @resource.tokens[@client_id] = {
          token: BCrypt::Password.create(@token),
          expiry: (Time.now + DeviseTokenAuth.token_lifespan).to_i,
        }
        @resource.save!
        update_auth_header
      end
    end

    def save_and_render_resource
      if @resource.save
        synced = sync_with_salesforce
        unless synced
          # undo user creation
          @resource.destroy
          return render_create_error
        end

        yield @resource if block_given?
        handle_registration_success
        render_create_success
      else
        clean_up_passwords @resource
        render_create_error
      end
    end

    def render_create_error
      render json: {
        status: 'error',
        data:   @resource.as_json,
        errors: resource_errors,
      }, status: 422
    end

    def render_create_success
      resource = @resource.as_json
      resource['confirmed_at'] = @resource.confirmed_at
      render json: {
        status: 'success',
        data:   resource,
      }
    end

    def resource_errors
      full_messages = @resource.errors.full_messages
      @resource.errors.to_hash.merge(full_messages: full_messages)
    end

    def sync_with_salesforce
      return false if @resource.errors.any?
      salesforce_contact = AccountService.create_or_update(account_params)
      unless salesforce_contact && salesforce_contact['contactId'].present?
        @resource.errors.set(:salesforce_contact_id, ["can't be blank"])
        return false
      end
      @resource.update_attributes(
        salesforce_contact_id: salesforce_contact['contactId'],
      )
    end

    def account_params
      params
        .require(:contact)
        .permit(:firstName, :middleName, :lastName, :DOB, :email)
    end

    def sign_up_params
      params
        .require(:user)
        .permit(:email, :password, :password_confirmation, :temp_session_id)
    end
  end
end
