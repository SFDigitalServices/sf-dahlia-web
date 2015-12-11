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

  # TODO: remove fake generation of matches once the real ones exist
  def eligibility
    @listings = SalesforceService.listings
    @listings.each do |listing|
      # fake it 'till you make it!
      listing['Eligibility_Match'] = rand < 0.5 ? 1 : 2
    end
    render json: { listings: @listings }
  end
end
