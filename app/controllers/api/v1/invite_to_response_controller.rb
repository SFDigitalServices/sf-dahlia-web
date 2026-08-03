class Api::V1::InviteToResponseController < ApiController
  before_action :validate_token!, only: :record_response

  def record_response
    params.expect(record: %i[response action])
    response, action = params[:record].values_at(:response, :action)

    type, deadline, application_id, application_number, listing_id = token_fields
    return unauthorized! if [type, deadline, application_id, application_number,
                             listing_id].any?(&:blank?)

    parsed_deadline = parse_deadline(deadline)
    return unauthorized! if parsed_deadline.blank?

    if deadline_passed?(parsed_deadline)
      Rails.logger.info('InviteToResponseController#record_response: deadline passed - not recording')
    else
      DahliaBackend::MessageService.send_invite_to_response(
        deadline,
        application_id,
        application_number,
        response,
        action,
        listing_id,
      )
    end

    render json: { success: true }, status: :ok
  rescue ActionController::ParameterMissing
    render json: { error: 'Bad request' }, status: :bad_request
  rescue StandardError => e
    Rails.logger.error("Submit response error: #{e.message}")
    render json: { error: 'Submit response error' }, status: :internal_server_error
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
      @token_payload[:applicationNumber],
      @token_payload[:listingId],
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
