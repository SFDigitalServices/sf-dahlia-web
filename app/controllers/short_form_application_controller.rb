# Controller for the DAHLIA short form application.
class ShortFormApplicationController < ApplicationController
  def index
    @short_form_application_props = {
      assetPaths: static_asset_paths,
      listing_id: params[:id],
    }
  end

  protected

  def use_react_app
    true
  end
end
