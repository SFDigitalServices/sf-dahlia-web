# Controller for the authentication pages.
class AuthController < ApplicationController
  def sign_in
    @sign_in_props = { assetPaths: static_asset_paths }
  end

  def create_account
    @create_account_props = { assetPaths: static_asset_paths }
    render 'create_account'
  end

  def forgot_password
    @forgot_password_props = { assetPaths: static_asset_paths }
    render 'forgot_password'
  end

  def reset_password
    @reset_password_props = { assetPaths: static_asset_paths }
    render 'reset_password'
  end

  protected

  def use_react_app
    ENV['SIGN_IN_PAGE_REACT'].to_s.casecmp('true').zero?
  end
end
