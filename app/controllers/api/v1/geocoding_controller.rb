# RESTful JSON API to query for address geocoding
class Api::V1::GeocodingController < ApiController
  def geocode
    service = GeocodingService.new(address_params)
    # could be nil if no results found
    @geocoding_data = service.geocode
    render json: { geocoding_data: @geocoding_data }
  end

  private

  def address_params
    params.require(:address).permit(:address1, :city, :zip)
  end
end
