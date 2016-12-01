# RESTful JSON API to query for address geocoding
class Api::V1::GeocodingController < ApiController
  def geocode
    render json: { geocoding_data: { boundary_match: check_boundary_match } }
  end

  private

  # If we get a valid address from geocoder and a valid response from boundary service,
  # return the boundary service match response.
  # Otherwise, always return a false match so users can move on with the application
  def check_boundary_match
    geocoded_addresses = ArcGISService::GeocodingService.new(address_params).geocode

    if geocoded_addresses[:candidates].present?
      # TODO: revive this code once NRHP matching is ready to go live
      address = geocoded_addresses[:candidates].first
      x = address[:location][:x]
      y = address[:location][:y]
      name = '2198 Market' # TODO: remove hardcoded listing name
      match = ArcGISService::NeighborhoodBoundaryService.new(name, x, y).in_boundary?

      if match[:errors].present?
        ArcGISNotificationService.new(
          match.merge(service_name: ArcGISService::NeighborhoodBoundaryService::NAME),
          log_params,
        )

        false
      else
        match
      end
    else
      ArcGISNotificationService.new(
        geocoded_addresses.merge(service_name: ArcGISService::GeocodingService::NAME),
        log_params,
      )

      false
    end
  end

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
