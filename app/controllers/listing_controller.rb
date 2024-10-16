# Controller for the listing detail page
class ListingController < ApplicationController
  before_action :check_fcfs_flag, only: [:how_to_apply]

  def index
    @listing_detail_props = { assetPaths: static_asset_paths }
  end

  def how_to_apply
    @how_to_apply_props = { assetPaths: static_asset_paths }
    listing_id = params['id']
    listing = Force::ListingService.listing(listing_id)
    # if listing is not ownership fcfs
    if listing['RecordType']['Name'] != 'Ownership' ||
       listing['Listing_Type'] != 'First Come, First Served' ||
       # If the listing is closed, redirect
       # TODO: DAH-2846 Status will be added to the listing object
       # Until then, that field will be nil
       (!listing['Status'].nil? && listing['Status'] != 'Active') ||
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

  def check_fcfs_flag
    return if Rails.configuration.unleash.is_enabled? 'FCFS'

    # use the listing_path helper to redirect to the listing page
    # https://edgeguides.rubyonrails.org/routing.html#generating-paths-and-urls-from-code
    redirect_to listing_path(lang: params[:lang]) and return
  end
end
