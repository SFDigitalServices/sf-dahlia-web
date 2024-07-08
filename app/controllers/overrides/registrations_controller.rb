module Overrides
  # Overrides to DeviseTokenAuth
  class RegistrationsController < DeviseTokenAuth::RegistrationsController
    # method copied from original gem; refactored to please Rubocop
    def create
      setup_resource_for_create
      return render_create_error if name_fields_have_invalid_characters?

      if resource_class.devise_modules.include?(:confirmable) && !@redirect_url
        return render_create_error_missing_confirm_success_url
      end

      # if whitelist is set, validate redirect_url against whitelist
      if DeviseTokenAuth.redirect_whitelist && !DeviseTokenAuth.redirect_whitelist.include?(@redirect_url)
        return render_create_error_redirect_url_not_allowed
      end

      begin
        # override email confirmation, must be sent manually from ctrl

        resource_class.set_callback('create',
                                    :after,
                                    :send_on_create_confirmation_instructions)
        resource_class.skip_callback('create',
                                     :after,
                                     :send_on_create_confirmation_instructions)
        save_and_render_created_registration
      rescue ActiveRecord::RecordNotUnique
        clean_up_passwords @resource
        render_create_error_email_already_exists
      end
    end

    private

    def error_checks_for_create
      # success redirect url is required
    end

    def name_fields_have_invalid_characters?
      includes_url_characters(params[:contact][:firstName]) || includes_url_characters(params[:contact][:lastName]) || includes_url_characters(params[:contact][:middleName])
    end

    def includes_url_characters(value)
      value.include?('www') || value.include?('http')
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

    def save_and_render_created_registration
      if @resource.save
        # <SFDAHLIA ...
        synced = sync_with_salesforce
        if synced
          attach_temp_files_to_new_user
        else
          # undo user creation
          @resource.destroy
          return render_create_error
        end
        # />

        yield @resource if block_given?
        handle_registration_success
        render_create_success
      else
        clean_up_passwords @resource
        render_create_error
      end
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

    def render_create_error
      render json: {
        status: 'error',
        data: @resource.as_json,
        errors: resource_errors,
      }, status: 422
    end

    def render_create_success
      resource = @resource.as_json
      resource['confirmed_at'] = @resource.confirmed_at
      render json: {
        status: 'success',
        data: resource,
      }
    end

    def resource_errors
      full_messages = @resource.errors.full_messages
      @resource.errors.to_hash.merge(full_messages:)
    end

    def sync_with_salesforce
      return false if @resource.errors.any?

      attrs = account_params.merge(webAppID: current_user.id)
      salesforce_contact = Force::AccountService.create_or_update(attrs)
      unless salesforce_contact && salesforce_contact['contactId'].present?
        @resource.errors.set(:salesforce_contact_id, ["can't be blank"])
        return false
      end
      @resource.update(
        salesforce_contact_id: salesforce_contact['contactId'],
      )
    end

    def attach_temp_files_to_new_user
      files = UploadedFile.where(session_uid: @resource.temp_session_id)
      files.update_all(user_id: @resource.id)
    end

    def account_params
      params
        .require(:contact)
        .permit(:firstName, :middleName, :lastName, :DOB, :email)
        .to_h
    end

    # override DeviseTokenAuth method
    def sign_up_params
      user_params
    end

    # override DeviseTokenAuth method
    def account_update_params
      user_params
    end

    def user_params
      params
        .require(:user)
        .permit(:email, :password, :password_confirmation, :temp_session_id)
        .to_h
    end
  end
end
