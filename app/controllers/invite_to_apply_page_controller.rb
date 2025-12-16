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

    # TODO: isTestEmail toggle

    if decoded_params['response'].present? &&
       !deadline_has_passed(decoded_params['deadline'])
      record_response(
        decoded_params['deadline'],
        decoded_params['applicationNumber'],
        decoded_params['response'],
      )
    end

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
    }

    if use_jwt? && url_params[:deadline].present?
      submit_preview_link_token_param = encode_token(
        {
          deadline: Time.zone.parse(url_params[:deadline]).to_i,
          applicationNumber: decoded_params['applicationNumber'],
        },
      )
    end

    {
      assetPaths: static_asset_paths,
      urlParams: url_params,
      submitPreviewLinkTokenParam: submit_preview_link_token_param,
    }.compact
  end

  def record_response(deadline, application_number, response)
    Rails.logger.info("Recording response: deadline=#{deadline}, application_number=#{application_number}, response=#{response}")

    DahliaBackend::MessageService.send_invite_to_apply_response(
      deadline,
      application_number,
      response,
      params['id'],
    )
  end

  def decode_token(token)
    if token.blank?
      lang = params[:lang] ? "/#{params[:lang]}" : ''
      return "#{lang}/listings/#{params[:id]}"
    end

    # [{"exp" => 946598400, "data" => {"deadline" => "1999-12-31", "response" => "yes", "applicationNumber" => "12345678"}, "iat" => 946512000}, {"alg" => "HS256", "typ" => "JWT"}]
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
    JWT.encode({ data: params }, ENV.fetch('JWT_TOKEN_SECRET'), ENV.fetch('JWT_ALGORITHM'))
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
