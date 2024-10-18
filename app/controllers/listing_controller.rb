# Controller for the listing detail page
class ListingController < ApplicationController
  def index
    @listing_detail_props = { assetPaths: static_asset_paths }
  end

  def how_to_apply
    @how_to_apply_props = { assetPaths: static_asset_paths }
    render 'how_to_apply'
  end

  protected

  def use_react_app
    true
  end
end
