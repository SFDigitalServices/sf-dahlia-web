# Controller for the authentication pages.
class AuthController < ApplicationController
  def sign_in
    @sign_in_props = { assetPaths: static_asset_paths }
  end

  def create_account
    @account_information_props = { assetPaths: static_asset_paths }
    render 'create_account'
  end

  def forgot_password
    @account_information_props = { assetPaths: static_asset_paths }
    render 'forgot_password'
  end

  protected

  def use_react_app
    ENV['SIGN_IN_PAGE_REACT'].to_s.casecmp('true').zero?
  end
end
