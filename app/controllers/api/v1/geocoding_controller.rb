# RESTful JSON API to query for address geocoding
class Api::V1::GeocodingController < ApiController
  def geocode
    # could be nil if no results found
    @data = GeocodingService.new(address_params).geocode
    if @data
      x = @data['location']['x']
      y = @data['location']['y']
      name = '2198 Market' # TODO: remove hardcoded listing name
      match = NeighborhoodBoundaryService.new(name, x, y).in_boundary?
      @data[:boundary_match] = match
    else
      @data = { boundary_match: false }
    end
    render json: { geocoding_data: @data }
  end

  private

  def address_params
    params.require(:address).permit(:address1, :city, :zip)
  end
end
