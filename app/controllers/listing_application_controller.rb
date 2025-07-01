# Controller for the listing application page
class ListingApplicationController < ApplicationController
  def index
    @listing_application_props = {
      assetPaths: static_asset_paths,
      listingId: params['id'],
    }
  end

  protected

  def use_react_app
    true
  end
end
