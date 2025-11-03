# Controller for the page shown when applicants respond to interest email
class ListingInterestPageController < ApplicationController
  def index
    @listing_interest_props = { assetPaths: static_asset_paths,
                                urlParams: { listing: params['listing'],
                                             response: params['response'] } }
    render 'listing_interest'
  end

  def deadline_passed
    @listing_interest_props = { 
      assetPaths: static_asset_paths,
      urlParams: { 
        listingId: params['listingId'],
        response: 'x'
      } 
    }
    render 'listing_interest'
  end

  def use_react_app
    true
  end
end
