module Overrides
  # Overrides to DeviseTokenAuth
  class PasswordsController < DeviseTokenAuth::PasswordsController
    private

    # easiest way to add this email hook without having to override the whole
    # update method from the gem
    def render_update_success
      Emailer.account_update(current_user).deliver_later
      super
    end

    # copied from gem,
    # so we can override ability to reset password without current_password
    def resource_update_method
      if params[:current_password].nil? ||
         DeviseTokenAuth.check_current_password_before_update == false ||
         @resource.allow_password_change == true
        'update'
      else
        'update_with_password'
      end
    end

    def render_edit_error
      # TODO: Create a proper token expired error message?
      redirect_to root_url
    end
  end
end
