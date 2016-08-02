module Overrides
  # Overrides to DeviseTokenAuth
  class ConfirmationsController < DeviseTokenAuth::ConfirmationsController
    # method copied from original gem; refactored to please Rubocop
    def show
      @resource = resource_class.confirm_by_token(params[:confirmation_token])

      if @resource && @resource.id
        return if check_for_link_expiration
        # create client id
        add_resource_token

        yield if block_given?

        redirect_to(@resource.build_auth_url(
                      redirect_url,
                      token: @token,
                      client_id: @client_id,
                      account_confirmation_success: true,
                      config: params[:config],
        ))
      else
        # raise ActionController::RoutingError, 'Not Found'
        redirect_to root_url
      end
    end

    def create
      @resource = resource_class.find_by_email(params[:email])
      if @resource and @resource.id
        @resource.resend_confirmation_instructions
        render json: { success: true }
      else
        render json: { success: false }, status: 422
      end
    end

    private

    def check_for_link_expiration
      if @resource.errors[:salesforce_contact_id].present?
        redirect_to "/sign-in?expiredUnconfirmed=#{@resource.email}"
        true
      end
      if @resource.confirmed?
        redirect_to "/sign-in?expiredConfirmed=#{@resource.email}"
        true
      end
    end

    def redirect_url
      if params[:redirect_url].present?
        params[:redirect_url]
      else
        root_url + 'my-account'
      end
    end

    def add_resource_token
      @client_id  = SecureRandom.urlsafe_base64(nil, false)
      @token      = SecureRandom.urlsafe_base64(nil, false)
      @token_hash = BCrypt::Password.create(@token)
      @expiry     = (Time.now + DeviseTokenAuth.token_lifespan).to_i

      @resource.tokens[@client_id] = {
        token:  @token_hash,
        expiry: @expiry,
      }
      @resource.save!
    end
  end
end
