# RESTful JSON API to query for listings
class Api::V1::ListingsController < ApiController
  def index
    # params[:ids] could be nil which means get all open listings
    # params[:ids] is a comma-separated list of ids
    params[:ids] = params[:ids] if params[:ids].present?
    @listings = SalesforceService.listings(params[:ids])
    render json: { listings: @listings }
  end

  def show
    @listing = SalesforceService.listing(params[:id])
    render json: { listing: @listing }
  end

  def eligibility
    e = params[:eligibility]
    # have to massage params into number values
    filters = {
      householdsize: e[:householdsize].to_i,
      incomelevel: e[:incomelevel].to_f,
      childrenUnder6: e[:childrenUnder6].to_i,
    }
    @listings = SalesforceService.eligible_listings(filters)
    render json: { listings: @listings }
  end

  def ami
    percent = params[:percent].presence || 100
    @ami = SalesforceService.ami(percent)
    render json: { ami: @ami }
  end

  def lottery_preferences
    @lottery_preferences = SalesforceService.lottery_preferences
    render json: { lottery_preferences: @lottery_preferences }
  end
end
