# Controller for the get assistance pages
class ConfirmingEmailController < ApplicationController
  def confirming_email
    # TODO: assetPaths vs urlParams
    @confirming_email_props = { assetPaths: static_asset_paths,
                                urlParams: { listing: params['listing'],
                                             response: params['response'] } }
    render 'confirming_email'
  end

  protected

  def use_react_app
    ENV['GET_ASSISTANCE_PAGES_REACT'].to_s.casecmp('true').zero?
  end
end
