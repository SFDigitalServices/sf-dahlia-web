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

  # TODO: fake for now
  def eligibility
    @listings = SalesforceService.listings
    @listings.each do |listing|
      listing['fake_eligibility_match'] = rand < 0.5 ? 1 : 2
    end
  end
end
