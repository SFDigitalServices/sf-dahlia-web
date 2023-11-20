# frozen_string_literal: true

# RESTful JSON API to query for listings
class Api::V1::ListingsController < ApiController
  def index
    # params[:ids] could be nil which means get all open listings
    # params[:ids] is a comma-separated list of ids
    @listings = Force::ListingService.listings(listings_params)

    render json: { listings: @listings }
  end

  def show
    @listing = Force::ListingService.listing(params[:id], force: params[:force])
    render json: { listing: @listing }
  end

  def units
    @units = Force::ListingService.units(params[:id], force: params[:force])
    render json: { units: @units }
  end

  def lottery_buckets
    @lottery_buckets = Force::ListingService.lottery_buckets(params[:id],
                                                             force: params[:force])
    render json: @lottery_buckets
  end

  def lottery_ranking
    @lottery_ranking = Force::ListingService.lottery_ranking(
      params[:id],
      params[:lottery_number],
    )
    render json: @lottery_ranking
  end

  def listingPricingTable
    @listing_pricing_table = Force::ListingService.listing_pricing_table(
      params[:id],
    )
    render json: @listing_pricing_table
  end

  def preferences
    @preferences = Force::ListingService.preferences(params[:id], force: params[:force])
    render json: { preferences: @preferences }
  end

  def eligibility
    # have to massage params into number values
    filters = {
      householdsize: params[:householdsize].to_i,
      incomelevel: params[:incomelevel].to_f,
      childrenUnder6: params[:childrenUnder6].to_i,
      type: params[:listingsType],
    }
    @listings = Force::ListingService.eligible_listings(filters)
    render json: { listings: @listings }
  end

  def ami
    # loop through all the ami levels that you just sent me
    # call Force::ListingService.ami with each set of opts
    @ami_levels = []
    params[:chartType]&.each_with_index do |chart_type, i|
      data = {
        chartType: chart_type,
        percent: params[:percent][i],
        year: params[:year][i],
      }
      @ami_levels << {
        percent: data[:percent],
        values: Force::ListingService.ami(data),
      }
    end
    render json: { ami: @ami_levels }
  end

  private

  def listings_params
    params.permit(:ids, :type, :subset).to_h
  end
end
