# RESTful JSON API to query for address geocoding
class Api::V1::GeocodingController < ApiController
  def geocode
    service = GeocodingService.new(address_params)
    # could be nil if no results found
    @geocoding_data = service.geocode
    status = 200 # default to success
    status = 422 if @geocoding_data.nil?
    render json: { geocoding_data: @geocoding_data }, status: status
  end

  private

  def address_params
    params.require(:address).permit(:address1, :city, :zip)
  end
end
