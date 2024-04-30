# Controller for the listing detail page
class ShortformController < ApplicationController
  def index
    @listing_application_props = { assetPaths: static_asset_paths }
  end

  protected

  def use_react_app
    true
  end
end
