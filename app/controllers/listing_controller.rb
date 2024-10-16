# Controller for the listing detail page
class ListingController < ApplicationController
  before_action :should_allow_render, only: [:how_to_apply]

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

  def should_allow_render
    # if the FCFS feature flag is enabled
    listing_id = params['id']
    listing = Force::ListingService.listing(listing_id)
    return if fcfs_flag_enabled &&
              listing_type_fcfs_sales_bmr(listing) &&
              listing_active(listing)

    # use the listing_path helper to redirect to the listing page
    # https://edgeguides.rubyonrails.org/routing.html#generating-paths-and-urls-from-code
    redirect_to listing_path(lang: params[:lang]) and return
  end

  private

  def fcfs_flag_enabled
    Rails.configuration.unleash.is_enabled? 'FCFS'
  end

  def listing_type_fcfs_sales_bmr(listing)
    # Record Type has to be Ownership
    # Listing Type has to be First Come, First Served
    listing['RecordType']['Name'] == 'Ownership' &&
      listing['Listing_Type'] == 'First Come, First Served'
  end

  def listing_active(listing)
    # Status has to be Active
    # TODO: DAH-2846 Status will be added to the listing object
    # Until then, that field will be nil
    (!listing['Status'].nil? && listing['Status'] == 'Active') ||
      # Accepting Online Applications has to be true
      listing['Accepting_Online_Applications'] == true
  end
end
