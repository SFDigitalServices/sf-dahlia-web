class Api::V1::InviteToResponseController < ApiController

  def record_response
    params.expect(record: %i[type deadline appId action listingId])
    params[:record].each do |k, v|
      raise "#{k} cannot be blank: #{v.inspect}" if v.blank?
    end

    type, deadline, application_id, action, listing_id =
      params[:record].values_at(:type, :deadline, :appId, :action, :listingId)

    if deadline_has_passed?(deadline)
      Rails.logger.info(
        'InviteToResponseController#record_response: deadline passed - not recording ' \
        "listingId=#{listing_id}, " \
        "deadline=#{deadline}, " \
        "appId=#{application_id}, " \
        "action=#{action}",
      )
    else
      DahliaBackend::MessageService.send_invite_to_response(
        type,
        deadline,
        application_id,
        action,
        listing_id,
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
