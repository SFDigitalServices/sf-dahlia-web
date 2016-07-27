# RESTful JSON API to query for listings
class Api::V1::ListingsController < ApiController
  ListingService = SalesforceService::ListingService

  def index
    # params[:ids] could be nil which means get all open listings
    # params[:ids] is a comma-separated list of ids
    params[:ids] = params[:ids] if params[:ids].present?
    @listings = ListingService.listings(params[:ids])
    render json: { listings: @listings }
  end

  def show
    @listing = ListingService.listing(params[:id])
    render json: { listing: @listing }
  end

  def units
    @units = ListingService.units(params[:id])
    render json: { units: @units }
  end

  def lottery_results
    @lottery_results = ListingService.lottery_results(params[:id])
    render json: { lottery_results: @lottery_results }
  end

  def lottery_buckets
    @lottery_buckets = ListingService.lottery_buckets(params[:id])
    render json: { lottery_buckets: @lottery_buckets }
  end

  def eligibility
    e = params[:eligibility]
    # have to massage params into number values
    filters = {
      householdsize: e[:householdsize].to_i,
      incomelevel: e[:incomelevel].to_f,
      childrenUnder6: e[:childrenUnder6].to_i,
    }
    @listings = ListingService.eligible_listings(filters)
    render json: { listings: @listings }
  end

  def ami
    percent = params[:percent].presence || 100
    @ami = ListingService.ami(percent)
    render json: { ami: @ami }
  end

  def lottery_preferences
    @lottery_preferences = ListingService.lottery_preferences
    render json: { lottery_preferences: @lottery_preferences }
  end
end
