# Sends email notifications related to geocoding errors
class ArcGISNotificationService
  def initialize(service_data, log_params)
    @service_data = service_data
    @log_params = log_params
  end

  def send_notifications
    send_address_notification if @service_data[:candidates] &&
                                 @service_data[:candidates].empty? &&
                                 # Send notification of address not found only if address
                                 # is in San Francisco
                                 @log_params[:city].casecmp('San Francisco').zero?

    send_error_notification if @service_data[:errors].present?
  end

  def send_address_notification
    GeocodingLog.create(@log_params)
    Emailer.geocoding_log_notification(@log_params).deliver_later
  end

  def send_error_notification
    Emailer.geocoding_error_notification(@service_data, @log_params).deliver_later
  end
end
