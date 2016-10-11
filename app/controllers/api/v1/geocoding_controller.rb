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
      if address_params[:city].casecmp('San Francisco') == 0
        log = GeocodingLog.create(log_params)
        Emailer.geocoding_log_notification(log).deliver_now
      end
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

  def listing_params
    params.require(:listing).permit(:Id, :Name)
  end

  def log_params
    {
      address: address_params[:address1],
      city: address_params[:city],
      zip: address_params[:zip],
      member: member_params.as_json,
      applicant: applicant_params.as_json,
      listing_id: listing_params[:Id],
    }
  end
end
