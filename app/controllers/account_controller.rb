# Controller for the Account Information pages
class AccountController < ApplicationController
  def account
    render_account_page(new_layout: 'account', old_layout: 'my_account')
  end

  def applications
    render_account_page(new_layout: 'applications', old_layout: 'my_applications')
  end

  def settings
    render_account_page(new_layout: 'settings', old_layout: 'account_settings')
  end

  def contact
    unless new_account_layout?
      redirect_to account_redirect_path
      return
    end

    @account_information_props = { assetPaths: static_asset_paths }
    render 'contact'
  end

  protected

  def use_react_app
    true
  end

  private

  def render_account_page(new_layout:, old_layout:)
    @account_information_props = { assetPaths: static_asset_paths }
    render(new_account_layout? ? new_layout : old_layout)
  end

  def new_account_layout?
    Rails.configuration.unleash.is_enabled?('temp.webapp.newAccountLayout')
  end

  def account_redirect_path
    params[:lang].present? ? "/#{params[:lang]}/account" : '/account'
  end
end
