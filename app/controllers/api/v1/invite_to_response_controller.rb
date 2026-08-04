class Api::V1::InviteToResponseController < ApiController

  def record_response
    params.expect(record: %i[deadline appId action])
    deadline, application_id, action =
      params[:record].values_at(:deadline, :appId, :action)

    if deadline_has_passed?(deadline)
      Rails.logger.info(
        'InviteToResponseController#record_response: deadline passed - not recording ' \
        "deadline=#{deadline}, " \
        "appId=#{application_id}, " \
        "action=#{action}",
      )
    else
      DahliaBackend::MessageService.send_invite_to_response(
        deadline,
        application_id,
        action,
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
