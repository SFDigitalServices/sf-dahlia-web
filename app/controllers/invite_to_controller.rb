# Invite to X controller
class InviteToController < ApplicationController
  def index
    # TODO: uncomment when backend token updated
    # decoded_params = decode_token(params[:t])
    # if decoded_params.is_a?(String)
    #   redirect_to decoded_params
    #   return
    # end
    decoded_params ||= params
    @invite_to_props = props(decoded_params)
    # Get file upload URL for application
    if decoded_params['appId'].present?
      application = Force::ShortFormService.get(decoded_params['appId'])
      @invite_to_props = @invite_to_props.merge(
        url: application['uploadURL'],
      )
    end
    if decoded_params['applicationNumber'].present?
      application = Force::ShortFormService.get(decoded_params['applicationNumber'])
      @invite_to_props = @invite_to_props.merge(
        url: application['uploadURL'],
      )
    end
    record_response(decoded_params)
    render 'invite_to'
  end

  def documents
    @invite_to_props = props(params).merge(documentsPath: true)
    render 'invite_to'
  end

  private

  # Deprecated I2A pilot - remove references to applicationNumber and response in DAH-4045
  def props(decoded_params = params)
    url_params = {
      type: decoded_params['type'],
      deadline: decoded_params['deadline'],
      act: decoded_params['act'] || decoded_params['response'],
      appId: decoded_params['appId'] || decoded_params['applicationNumber'],
    }

    {
      assetPaths: static_asset_paths,
      urlParams: url_params,
      submitPreviewLinkTokenParam: encode_token(url_params.except(:act, :response)),
    }.compact
  end

  def record_response(decoded_params)
    deadline = decoded_params['deadline']
    response = decoded_params['response']
    application_number = decoded_params['applicationNumber']
    invite_action = decoded_params['act']
    app_id = decoded_params['appId']

    if (invite_action.blank? && response.blank?) || (deadline && deadline_has_passed?(deadline)) || language_change?
      Rails.logger.info(
        'InviteToController#record_response: *NOT* recording ' \
        "deadline=#{deadline}, " \
        "app_id=#{app_id}, " \
        "application_number=#{application_number}, " \
        "act=#{invite_action.inspect}, " \
        "response=#{response.inspect}",
      )
      return
    end

    Rails.logger.info(
      'InviteToController#record_response: recording ' \
      "deadline=#{deadline}, " \
      "app_id=#{app_id}, " \
      "application_number=#{application_number}, " \
      "act=#{invite_action}, " \
      "response=#{response}",
    )

    DahliaBackend::MessageService.send_invite_to_apply_response(
      deadline,
      app_id,
      application_number,
      response,
      invite_action,
      params['id'], # listing_id
    )
  end

  def decode_token(token)
    if token.blank?
      return url_for(
        controller: 'listing', id: params[:id], lang: params[:lang],
      )
    end

    # [
    #   {
    #     "exp" => 946598400,
    #     "data" => {
    #       "type" => "I2I",
    #       "deadline" => "1999-12-31",
    #       "act" => "yes",
    #       "appId" => "12345678"
    #     },
    #     "iat" => 946512000
    #    },
    #   {"alg" => "HS256", "typ" => "JWT"}
    # ]
    decoded_token = JWT.decode(
      token,
      ENV.fetch('JWT_TOKEN_SECRET', nil),
      true,
      { algorithm: ENV.fetch('JWT_ALGORITHM', nil), verify_expiration: false },
    )
    Rails.logger.info(
      'InviteToController#decode_token: ' \
      "Decoded JWT #{decoded_token}",
    )
    decoded_token.first['data']
  rescue JWT::DecodeError
    Rails.logger.info(
      'InviteToController#decode_token: ' \
      "Invalid JWT in #{request.original_url}",
    )
    root_url
  end

  def encode_token(params)
    JWT.encode(
      { data: params },
      ENV.fetch('JWT_TOKEN_SECRET', nil),
      ENV.fetch('JWT_ALGORITHM', nil),
    )
  end

  def deadline_has_passed?(deadline)
    Time.zone.parse(deadline).to_date < Time.zone.today
  end

  def language_change?
    # return true when current url and referrer url look like:
    # '.../listings/a123/next-steps?...'
    # '.../es/listings/a123/next-steps?...'
    request.referrer&.include?(request.path.slice(%r{/listings/.+}))
  end

  def use_react_app
    true
  end
end
