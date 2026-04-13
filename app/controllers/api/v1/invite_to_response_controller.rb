class Api::V1::InviteToResponseController < ApiController

  def record_response
    params.expect(record: %i[type deadline appId applicationNumber response action listingId])
    type, deadline, application_id, application_number, response, action, listing_id =
      params[:record].values_at(:type, :deadline, :appId, :applicationNumber, :response, :action, :listingId)

    if deadline_has_passed?(deadline)
      Rails.logger.info(
        'InviteToResponseController#record_response: deadline passed - not recording ' \
        "type=#{type}, " \
        "listingId=#{listing_id}, " \
        "deadline=#{deadline}, " \
        "appId=#{application_id}, " \
        "applicationNumber=#{application_number}, " \
        "response=#{response}, " \
        "action=#{action}",
      )
    else
      DahliaBackend::MessageService.send_invite_to_response(
        deadline,
        application_id,
        application_number,
        response,
        action,
        listing_id
      )
    end
    render json: { success: true }, status: :ok
  rescue StandardError => e
    Rails.logger.error("Submit response error: #{e.message}")
    render json: { error: 'Submit response error' }, status: :internal_server_error
  end

  private

  def deadline_has_passed?(deadline)
    Time.zone.parse(deadline).to_date < Time.zone.today
  end
end
