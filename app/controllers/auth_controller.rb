# Controller for the authentication pages.
class AuthController < ApplicationController
  def sign_in
    @sign_in_props = react_app_props
  end

  def create_account
    @create_account_props = react_app_props
    render 'create_account'
  end

  def forgot_password
    @forgot_password_props = react_app_props
    render 'forgot_password'
  end

  def reset_password
    @reset_password_props = react_app_props
    render 'reset_password'
  end

  protected

  def use_react_app
    true
  end
end
