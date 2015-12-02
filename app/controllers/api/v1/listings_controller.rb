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
    use_json = Rails.env.development? && ENV['SALESFORCE_ENABLE'].blank?
    return true unless use_json
    # if not using salesforce, return fake JSON
    if params[:id].present?
      return render file: "public/json/listings/#{params[:id]}.json"
    else
      return render file: 'public/json/listings.json'
    end
  end
end
