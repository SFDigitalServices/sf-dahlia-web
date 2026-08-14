class Api::V1::InviteToResponseController < ApiController
  include InviteToEventLogging

  before_action :validate_token!, only: :record_response

  def record_response
    record_params = params.expect(record: %i[listingId action])
    return unauthorized! if [record_params[:listingId],
                             record_params[:action]].any?(&:blank?)

    # we must verify app id from token
    type, _deadline, app_id, act = token_fields
    return unauthorized! if [type, _deadline, app_id, act].any?(&:blank?)

    parsed_deadline = parse_deadline(_deadline)
    return unauthorized! if parsed_deadline.blank?

    if deadline_passed?(parsed_deadline)
      Rails.logger.info('InviteToResponseController#record_response: deadline passed - not recording')
    else
      DahliaBackend::MessageService.send_invite_to_response(
        _deadline,
        app_id,
        app_id,
        # most recent action taken (i.e. schedule appointment), rather than action originally specified in token (i.e. responded yes)
        record_params[:action],
        record_params[:action],
        record_params[:listingId],
      )
    end

    render json: { success: true }, status: :ok
  rescue ActionController::ParameterMissing
    render json: { error: 'Bad request' }, status: :bad_request
  rescue StandardError => e
    Rails.logger.error("Submit response error: #{e.message}")
    render json: { error: 'Submit response error' }, status: :internal_server_error
  end

  # Shadow-mode endpoint: records nothing - it never calls sf-dahlia-backend, so no
  # Salesforce state changes and no applicant email is sent. It only logs that the
  # client-side human-detection judged this page view to be a real human, so we can
  # compare against the server-side GET recording during the shadow rollout.
  # Safe to call repeatedly.
  def log_human_verified
    record = params.expect(record: [:type, :deadline, :appId, :listingId, :act, :trigger,
                                    :elapsedMs, { env: {} }])
    type, deadline, application_id, listing_id, act, trigger, elapsed_ms =
      record.values_at(:type, :deadline, :appId, :listingId, :act, :trigger, :elapsedMs)

    # Values come from an unauthenticated public endpoint. log_invite_event serializes the
    # payload with to_json, which escapes newline/control characters, so no per-field .inspect
    # is needed to guard against log forging.
    log_invite_event(
      outcome: 'suppressed',
      source: 'client_shadow',
      reason: 'shadow_human_verified',
      type: type,
      listing_id: listing_id,
      deadline: deadline,
      app_id: application_id,
      act: act,
      trigger: trigger, # interaction | dwell | teardown
      elapsed_ms: elapsed_ms,
      env: record[:env]&.to_unsafe_h, # passive browser signals for post-hoc classification
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

  def validate_token!
    payload = JsonWebTokenService.decode_token(params[:t])
    @token_payload = payload.with_indifferent_access
  rescue JsonWebTokenService::InvalidTokenError
    unauthorized!
  end

  def token_fields
    [
      @token_payload[:type],
      @token_payload[:deadline],
      @token_payload[:appId],
      @token_payload[:act],
    ]
  end

  def parse_deadline(deadline)
    Time.zone.parse(deadline.to_s)
  end

  def deadline_passed?(parsed_deadline)
    parsed_deadline.to_date < Time.zone.today
  end

  def unauthorized!
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end
end
