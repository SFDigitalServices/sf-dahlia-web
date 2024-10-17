# Controller for the listing detail page
class ListingController < ApplicationController
  before_action :check_fcfs_flag, only: [:how_to_apply]

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

  def check_fcfs_flag
    return if Rails.configuration.unleash.is_enabled? 'FCFS'

    # use the listing_path helper to redirect to the listing page
    # https://edgeguides.rubyonrails.org/routing.html#generating-paths-and-urls-from-code
    redirect_to listing_path(lang: params[:lang]) and return
  end
end
