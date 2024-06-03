# Controller for the Account Information pages
class AccountController < ApplicationController
    def my_account
      @account_information_props = { assetPaths: static_asset_paths }
      render 'my_account'
    end

    def account_settings
      @account_information_props = { assetPaths: static_asset_paths }
      render 'account_settings'
    end

    def my_applications
      @account_information_props = { assetPaths: static_asset_paths }
      render 'my_applications'
    end

    protected

    def use_react_app
      ENV['ACCOUNT_INFORMATION_PAGES_REACT'].to_s.casecmp('true').zero?
    end
  end
