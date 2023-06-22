# Controller for the listing detail page
class ListingController < ApplicationController
  def index
    @ListingDetailProps = {assetPaths: static_asset_paths}
  end

  protected

  def use_react_app
    ENV['LISTING_DETAIL_PAGE_REACT'].to_s.casecmp('true').zero?
  end
end
