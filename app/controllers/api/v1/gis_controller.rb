# RESTful JSON API to query for address geocoding
class Api::V1::GisController < ApiController
  GeocodingService = ArcGISService::GeocodingService
  NeighborhoodBoundaryService = ArcGISService::NeighborhoodBoundaryService

  def gis_data
    render json: { gis_data: geocoding_data }
  rescue StandardError => e
    logger.error "<< GISController Error >> #{e.class.name}, #{e.message}"
    # in this case, no need to throw an error alert, just allow the user to proceed
    render json: { gis_data: { boundary_match: nil } }
  end

  private

  # If we get a valid address from geocoder and a valid response from boundary
  # service, return the geocoding data with the boundary match response added.
  # Otherwise, always return at least a nil boundary match so users can move on
  # with the application.
  def geocoding_data
    geocoded_addresses = GeocodingService.new(address_params).geocode
    address = GeocodingService.select_best_candidate(geocoded_addresses[:candidates])

    if address.present?
      proj_id = params[:project_id]
      match = proj_id ? address_within_boundary?(address, proj_id) : nil
      return address.merge(boundary_match: match)
    else
      logger.error '<< GeocodingService.geocode candidates empty >> ' \
        "#{geocoded_addresses}, LOG PARAMS: #{log_params}"
      send_geocoding_error_notification(geocoded_addresses)

      { boundary_match: nil }
    end
  end

  def address_within_boundary?(address, project_id)
    return nil unless project_id.present? && address.present?

    x = address[:location][:x]
    y = address[:location][:y]
    neighborhood = NeighborhoodBoundaryService.new(project_id, x, y)
    match = neighborhood.in_boundary?
    matching_errors = neighborhood.errors
    return match unless matching_errors.present?

    logger.error '<< NeighborhoodBoundaryService.in_boundary? Error >>' \
      "#{matching_errors}, LOG PARAMS: #{log_params}"
    send_boundary_match_error_notification(matching_errors)

    nil
  end

  def send_geocoding_error_notification(geocoded_addresses)
    notifications_sent = ArcGISNotificationService.new(
      geocoded_addresses.merge(service_name: GeocodingService::NAME),
      log_params,
    ).send_notifications

    return if notifications_sent

    log_msg = '<< GISController ' \
      'send_geocoding_error_notification attempted but notifications not sent >>'
    logger.error log_msg
  end

  def send_boundary_match_error_notification(matching_errors)
    notifications_sent = ArcGISNotificationService.new(
      {
        errors: matching_errors,
        service_name: NeighborhoodBoundaryService::NAME,
      },
      log_params,
    ).send_notifications

    return if notifications_sent

    log_msg = '<< GISController ' \
      'send_boundary_match_error_notification attempted but notifications not sent >>'
    logger.error log_msg
  end

  def address_params
    params.require(:address).permit(:address1, :city, :state, :zip).to_h
  end

  def member_params
    params.require(:member).permit(:firstName, :lastName, :dob).to_h
  end

  def applicant_params
    params.require(:applicant).permit(:firstName, :lastName, :dob).to_h
  end

  def listing_params
    params.require(:listing).permit(:Id, :Name, :Project_ID).to_h
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
