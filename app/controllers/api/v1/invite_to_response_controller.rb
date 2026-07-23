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

  # Shadow-mode endpoint: records nothing to Salesforce or the backend. It only logs
  # that the client-side human-detection judged this page view to be a real human, so
  # we can compare against the server-side GET recording during the shadow rollout.
  # Safe to call repeatedly.
  def log_human_verified
    params.expect(record: %i[type deadline appId listingId act trigger elapsedMs])
    type, deadline, application_id, listing_id, act, trigger, elapsed_ms =
      params[:record].values_at(:type, :deadline, :appId, :listingId, :act, :trigger,
                                :elapsedMs)

    # Values come from an unauthenticated public endpoint, so .inspect each one to
    # neutralize newline/control-character log forging and make nil/blank values legible.
    Rails.logger.info(
      'InviteToResponseController#log_human_verified: ' \
      'human-verified click (shadow, not recorded) ' \
      "type=#{type.inspect}, " \
      "listingId=#{listing_id.inspect}, " \
      "deadline=#{deadline.inspect}, " \
      "appId=#{application_id.inspect}, " \
      "act=#{act.inspect}, " \
      "trigger=#{trigger.inspect}, " \
      "elapsedMs=#{elapsed_ms.inspect}",
    )
    render json: { success: true }, status: :ok
  rescue ActionController::ParameterMissing => e
    # Malformed client request, not a server fault - keep it out of 5xx error rates.
    Rails.logger.warn("Log human-verified click bad request: #{e.message}")
    render json: { error: 'Log human-verified click bad request' }, status: :bad_request
  rescue StandardError => e
    Rails.logger.error("Log human-verified click error: #{e.message}")
    render json: { error: 'Log human-verified click error' },
           status: :internal_server_error
  end

  private

  def deadline_has_passed?(deadline)
    Time.zone.parse(deadline).to_date < Time.zone.today
  end
end
