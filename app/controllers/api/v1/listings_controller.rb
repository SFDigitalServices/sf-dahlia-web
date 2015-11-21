# RESTful JSON API to query for listings
class Api::V1::ListingsController < ApiController
  def index
    @listings = SalesforceService.listings
  end
end
