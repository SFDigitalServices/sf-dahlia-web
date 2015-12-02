# RESTful JSON API to query for listings
class Api::V1::ListingsController < ApiController
  before_action :check_salesforce_enabled

  def index
    # params[:ids] could be nil which means get all open listings
    # params[:ids] is a comma-separated list of ids
    params[:ids] = params[:ids] if params[:ids].present?
    @listings = SalesforceService.listings(params[:ids])
  end

  def show
    @listing = SalesforceService.listing(params[:id])
  end

  private

  def check_salesforce_enabled
    use_salesforce = Rails.env.production? || ENV['SALESFORCE_ENABLE'].present?
    return true if use_salesforce
    # if not using salesforce, return fake JSON
    if params[:id].present?
      redirect_to "/json/listings/#{params[:id]}.json"
    else
      redirect_to '/json/listings.json'
    end
  end
end
