# RESTful JSON API to query for listings
class Api::V1::ListingsController < ApiController
  def index
    # params[:ids] could be nil which means get all open listings
    # params[:ids] is a comma-separated list of ids
    @listings = Force::ListingService.new.listings(params[:ids])
    render json: { listings: @listings }
  end

  def show
    @listing = Force::ListingService.new.listing(params[:id])
    render json: { listing: @listing }
  rescue Faraday::ClientError => e
    # Salesforce will throw an error if you request a listing ID that doesn't exist
    if e.message.include? 'APEX_ERROR'
      return render_error(exception: e, status: :not_found)
    end
    # else re-raise to default ApiController handler, e.g. for timeout
    raise e.class, e.message
  end

  def units
    @units = Force::ListingService.new.units(params[:id])
    render json: { units: @units }
  end

  def lottery_buckets
    @lottery_buckets = Force::ListingService.new.lottery_buckets(params[:id])
    render json: @lottery_buckets
  end

  def lottery_ranking
    @lottery_ranking = Force::ListingService.new.lottery_ranking(
      params[:id],
      params[:lottery_number],
    )
    render json: @lottery_ranking
  end

  def preferences
    @preferences = Force::ListingService.new.preferences(params[:id])
    render json: { preferences: @preferences }
  end

  def eligibility
    # have to massage params into number values
    filters = {
      householdsize: params[:householdsize].to_i,
      incomelevel: params[:incomelevel].to_f,
      childrenUnder6: params[:childrenUnder6].to_i,
    }
    @listings = Force::ListingService.new.eligible_listings(filters)
    render json: { listings: @listings }
  end

  def ami
    # loop through all the ami levels that you just sent me
    # call Force::ListingService.new.ami with each set of opts
    @ami_levels = []
    params[:chartType].each_with_index do |chart_type, i|
      data = {
        chartType: chart_type,
        percent: params[:percent][i],
        year: params[:year][i],
      }
      @ami_levels << {
        percent: data[:percent],
        values: Force::ListingService.new.ami(data),
      }
    end
    render json: { ami: @ami_levels }
  end
end
