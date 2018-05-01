# RESTful JSON API to query for address geocoding
class Api::V1::GeocodingController < ApiController
  GeocodingService = ArcGISService::GeocodingService
  NeighborhoodBoundaryService = ArcGISService::NeighborhoodBoundaryService

  def geocode
    render json: { geocoding_data: geocoding_data }
  rescue StandardError => e
    logger.error "<< GeocodingController Error >> #{e.class.name}, #{e.message}"
    # in this case, no need to throw an error alert, just allow the user to proceed
    render json: { geocoding_data: { boundary_match: nil } }
  end

  private

  # If we get a valid address from geocoder and a valid response from boundary service,
  # return the boundary service match response.
  # Otherwise, always return a nil match so users can move on with the application
  def geocoding_data
    geocoded_addresses = GeocodingService.new(address_params).geocode
    if geocoded_addresses[:candidates].present?
      address = geocoded_addresses[:candidates].first
      # if the listing has either the ADHP or NRHP preference, then do
      # boundary matching. if the listing doesn't have either of those
      # preferences, there is no relevant boundary to match the address
      # against, so don't bother matching
      match = params[:adhp] || params[:nrhp] ? address_within_neighborhood?(address) : nil
      return address.merge(boundary_match: match)
    else
      logger.error '<< GeocodingService.geocode candidates empty >> ' \
        "#{geocoded_addresses}, LOG PARAMS: #{log_params}"
      send_geocoding_error_notification(geocoded_addresses)

      { boundary_match: nil }
    end
  end

  def address_within_neighborhood?(address)
    x = address[:location][:x]
    y = address[:location][:y]
    project_id = params[:adhp] ? 'ADHP' : listing_params[:Project_ID]
    return nil unless project_id.present?

    neighborhood = NeighborhoodBoundaryService.new(project_id, x, y)
    match = neighborhood.in_boundary?
    # return successful geocoded data with the result of boundary_match
    matching_errors = neighborhood.errors
    return match unless matching_errors.present?

    # otherwise notify of errors
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

    log_msg = '<< GeocodingController ' \
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

    log_msg = '<< GeocodingController ' \
      'send_boundary_match_error_notification attempted but notifications not sent >>'
    logger.error log_msg
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
