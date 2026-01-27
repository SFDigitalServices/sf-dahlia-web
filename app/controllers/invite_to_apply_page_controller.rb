# Controller for the page shown when applicants respond to invite to apply email
class InviteToApplyPageController < ApplicationController
  def index
    decoded_params = use_jwt? && decode_token(params[:t])
    if decoded_params.is_a?(String)
      redirect_to decoded_params
      return
    end

    decoded_params ||= params
    @invite_to_apply_props = props(decoded_params)
    application = Force::ShortFormService.get(decoded_params['applicationNumber'])
    Rails.logger.info(
      'Test log: ' \
      "application_number=#{decoded_params['applicationNumber']}, " \
      "application=#{application.to_json}",
    )

    # TODO: isTestEmail toggle

    record_response(decoded_params)
    render 'invite_to_apply'
  end

  def documents
    @invite_to_apply_props = props.merge(documentsPath: true)
    render 'invite_to_apply'
  end

  private

  def props(decoded_params = params)
    url_params = {
      deadline: decoded_params['deadline'],
      response: decoded_params['response'],
      applicationNumber: decoded_params['applicationNumber'],
      fileUploadUrl: decoded_params['fileUploadUrl'],
    }

    {
      assetPaths: static_asset_paths,
      urlParams: url_params,
      submitPreviewLinkTokenParam: encode_token(url_params.except(:response)),
    }.compact
  end

  def record_response(decoded_params)
    deadline = decoded_params['deadline']
    response = decoded_params['response']
    application_number = decoded_params['applicationNumber']
    file_upload_url = decoded_params['fileUploadUrl']

    if response.blank? || (deadline && deadline_has_passed?(deadline))
      Rails.logger.info(
        'InviteToApplyPageController#record_response: *NOT* recording ' \
        "deadline=#{deadline}, " \
        "application_number=#{application_number}, " \
        "response=#{response.inspect}",
        "file_upload_url=#{file_upload_url}",
      )
      return
    end

    Rails.logger.info(
      'InviteToApplyPageController#record_response: recording ' \
      "deadline=#{deadline}, " \
      "application_number=#{application_number}, " \
      "response=#{response}, " \
      "file_upload_url=#{file_upload_url}",
    )

    DahliaBackend::MessageService.send_invite_to_apply_response(
      deadline,
      application_number,
      response,
      params['id'], # listing_id
      file_upload_url,
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
    #       "deadline" => "1999-12-31",
    #       "response" => "yes",
    #       "applicationNumber" => "12345678"
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
      'InviteToApplyPageController#decode_token: ' \
      "Decoded JWT #{decoded_token}",
    )
    decoded_token.first['data']
  rescue JWT::VerificationError
    Rails.logger.info(
      'InviteToApplyPageController#decode_token: ' \
      "Invalid JWT in #{request.original_url}",
    )
    root_url
  end

  def encode_token(params)
    return nil unless use_jwt?

    JWT.encode(
      { data: params },
      ENV.fetch('JWT_TOKEN_SECRET', nil),
      ENV.fetch('JWT_ALGORITHM', nil),
    )
  end

  def deadline_has_passed?(deadline)
    Time.zone.parse(deadline).to_date < Time.zone.today
  end

  def use_jwt?
    Rails.configuration.unleash.is_enabled?('temp.webapp.inviteToApply.JwtLinkParams') &&
      ENV.fetch('JWT_TOKEN_SECRET', nil) &&
      ENV.fetch('JWT_ALGORITHM', nil)
  end

  def use_react_app
    true
  end
end
