# RESTful JSON API to query for listings
class Api::V1::ListingsController < ApiController
  def index
    # params[:ids] could be nil which means get all open listings
    # params[:ids] is a comma-separated list of ids
    params[:ids] = params[:ids] if params[:ids].present?
    @listings = SalesforceService.listings(params[:ids])
  end

  def show
    @listing = SalesforceService.listing(params[:id])
  end
end
