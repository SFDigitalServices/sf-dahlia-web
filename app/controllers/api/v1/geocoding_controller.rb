# RESTful JSON API to query for address geocoding
class Api::V1::GeocodingController < ApiController
  def geocode
    # could be nil if no results found
    @data = GeocodingService.new(geocoding_params).geocode
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

  def member_params
    params.require(:member).permit(:firstName, :lastName, :dob)
  end

  def applicant_params
    params.require(:applicant).permit(:firstName, :lastName, :dob)
  end

  def geocoding_params
    {
      address: address_params,
      member: member_params,
      applicant: applicant_params,
    }
  end
end
