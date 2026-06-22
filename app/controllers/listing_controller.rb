# Controller for the listing detail page
class ListingController < ApplicationController
  def index
    @listing_detail_props = react_app_props
  end

  def how_to_apply
    @how_to_apply_props = react_app_props
    render 'how_to_apply'
  end

  protected

  def use_react_app
    true
  end
end
