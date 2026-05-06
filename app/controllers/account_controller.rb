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

    # New redesigned account pages
    def my_account_v2
      @account_information_props = { assetPaths: static_asset_paths }
      render 'account'
    end

    def my_applications_v2
      @account_information_props = { assetPaths: static_asset_paths }
      render 'applications'
    end

    def account_settings_v2
      @account_information_props = { assetPaths: static_asset_paths }
      render 'settings'
    end

    protected

    def use_react_app
      ENV['ACCOUNT_INFORMATION_PAGES_REACT'].to_s.casecmp('true').zero?
    end
  end
