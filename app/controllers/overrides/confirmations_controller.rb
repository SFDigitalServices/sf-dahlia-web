module Overrides
  # Overrides to DeviseTokenAuth
  class ConfirmationsController < DeviseTokenAuth::ConfirmationsController
    def show
      @resource = resource_class.confirm_by_token(params[:confirmation_token])

      if @resource and @resource.id
        # create client id
        client_id  = SecureRandom.urlsafe_base64(nil, false)
        token      = SecureRandom.urlsafe_base64(nil, false)
        token_hash = BCrypt::Password.create(token)
        expiry     = (Time.now + DeviseTokenAuth.token_lifespan).to_i

        add_resource_token(client_id, token_hash, expiry)

        yield if block_given?

        redirect_to(@resource.build_auth_url(
                      params[:redirect_url],
                      token: token,
                      client_id: client_id,
                      account_confirmation_success: true,
                      config: params[:config],
        ))
      else
        raise ActionController::RoutingError, 'Not Found'
      end
    end

    private

    def add_resource_token(client_id, token_hash, expiry)
      @resource.tokens[client_id] = {
        token:  token_hash,
        expiry: expiry,
      }
      @resource.save!
    end
  end
end
