# RESTful JSON API to query for address geocoding
class Api::V1::GeocodingController < ApiController
  GeocodingService = ArcGISService::GeocodingService
  NeighborhoodBoundaryService = ArcGISService::NeighborhoodBoundaryService

  def geocode
    render json: { geocoding_data: geocoding_data }
  rescue StandardError => e
    logger.error "<< GeocodingController Error >> #{e.class.name}, #{e.message}"
    # in this case, no need to throw an error alert, just allow the user to proceed
    render json: { geocoding_data: { boundary_match: false } }
  end

  private

  # If we get a valid address from geocoder and a valid response from boundary service,
  # return the boundary service match response.
  # Otherwise, always return a false match so users can move on with the application
  def geocoding_data
    geocoded_addresses = GeocodingService.new(address_params).geocode
    if geocoded_addresses[:candidates].present?
      address = geocoded_addresses[:candidates].first
      match = address_within_neighborhood?(address)
      return address.merge(boundary_match: match)
    else
      ArcGISNotificationService.new(
        geocoded_addresses.merge(service_name: GeocodingService::NAME),
        log_params,
        params[:has_nrhp_adhp],
      ).send_notifications
      # default response
      { boundary_match: false }
    end
  end

  def address_within_neighborhood?(address)
    x = address[:location][:x]
    y = address[:location][:y]
    project_id = listing_params[:Project_ID]
    return false unless project_id.present?
    neighborhood = NeighborhoodBoundaryService.new(project_id, x, y)
    match = neighborhood.in_boundary?
    # return successful geocoded data with the result of boundary_match
    return match unless neighborhood.errors.present?

    # otherwise notify of errors
    ArcGISNotificationService.new(
      {
        errors: neighborhood.errors,
        service_name: NeighborhoodBoundaryService::NAME,
      },
      log_params,
      params[:has_nrhp_adhp],
    ).send_notifications
    # default response
    false
  end

  def address_params
    params.require(:address).permit(:address1, :city, :state, :zip)
  end

  def member_params
    params.require(:member).permit(:firstName, :lastName, :dob)
  end

  def applicant_params
    params.require(:applicant).permit(:firstName, :lastName, :dob)
  end

  def listing_params
    params.require(:listing).permit(:Id, :Name, :Project_ID)
  end

  def log_params
    {
      address: address_params[:address1],
      city: address_params[:city],
      state: address_params[:state],
      zip: address_params[:zip],
      member: member_params.as_json,
      applicant: applicant_params.as_json,
      listing_id: listing_params[:Id],
      listing_name: listing_params[:Name],
    }
  end
end
