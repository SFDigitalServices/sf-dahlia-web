module Overrides
  # Overrides to DeviseTokenAuth
  class ConfirmationsController < DeviseTokenAuth::ConfirmationsController
    # method copied from original gem; refactored to please Rubocop
    def show
      @resource = resource_class.confirm_by_token(params[:confirmation_token])

      if @resource && @resource.id
        return redirect_for_link_expiration if @resource.errors[:email].present?
        # create client id
        add_resource_token

        yield @resource if block_given?

        # we want to disable the after_action,
        # otherwise it will invalidate our current auth token
        DeviseTokenAuth.change_headers_on_each_request = false
        redirect_to(@resource.build_auth_url(
                      redirect_url,
                      token: @token,
                      client_id: @client_id,
                      account_confirmation_success: true,
                      config: params[:config],
                      utm_source: 'validationemail',
                      utm_campaign: 'validationemail',
                      utm_medium: 'email',
        ))
      else
        # no user was found with that confirmation token.
        # provide a more helpful error than just redirecting them?
        # although we can't determine their user/email, or if
        # their account has already been confirmed or not.
        redirect_to '/sign-in'
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

    def redirect_for_link_expiration
      error_details = @resource.error_details(:email)
      email = ERB::Util.url_encode(@resource.email)
      if error_details.include?(:confirmation_period_expired)
        redirect_to "/sign-in?expiredUnconfirmed=#{email}"
      else
        redirect_to "/sign-in?expiredConfirmed=#{email}"
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
        'expiry' => @expiry,
      }
      @resource.save!
    end
  end
end
