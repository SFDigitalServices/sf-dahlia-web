# Controller for the listing detail page
class ListingController < ApplicationController
  def index
    @listing_detail_props = { assetPaths: static_asset_paths }
  end

  def how_to_apply
    @how_to_apply_props = { assetPaths: static_asset_paths }
    listing_id = params['id']
    listing = Force::ListingService.listing(listing_id)
    if (!listing['Status'].nil? && listing['Status'] != 'Active') ||
       listing['Accepting_Online_Applications'] == false
      redirect_back_or_to({ action: 'index' })
      nil
    else
      render 'how_to_apply'
    end
  end

  protected

  def use_react_app
    true
  end
end
