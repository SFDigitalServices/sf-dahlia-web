# Controller for the authentication pages.
class AuthController < ApplicationController
  def sign_in
    @SignInProps = {assetPaths: static_asset_paths}
  end

  protected

  def use_react_app
    ENV['SIGN_IN_PAGE_REACT'].to_s.casecmp('true').zero?
  end
end
