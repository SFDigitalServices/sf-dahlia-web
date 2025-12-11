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

    if decoded_params['deadline'].present? &&
       Time.zone.parse(decoded_params['deadline']).to_date >= Time.zone.today
      record_response(
        decoded_params['deadline'],
        decoded_params['applicationNumber'],
        decoded_params['response'],
      )
    end

    render 'invite_to_apply'
  end

  def deadline_passed
    @invite_to_apply_props = props.merge(deadlinePassedPath: true)
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
      submit_link_token_param = encode_token(
        DateTime.parse(url_params[:deadline]).to_i,
        url_params.merge({ response: 'yes' }),
      )
    end

    {
      assetPaths: static_asset_paths,
      urlParams: url_params,
      submitLinkTokenParam: submit_link_token_param,
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
      { algorithm: ENV.fetch('JWT_ALGORITHM', nil) },
    )
    Rails.logger.info(
      'InviteToApplyPageController#decode_token: ' \
      "Decoded JWT #{decoded_token}",
    )
    decoded_token.first['data']
  rescue JWT::ExpiredSignature
    decoded_token_expired = JWT.decode(
      token,
      ENV.fetch('JWT_TOKEN_SECRET', nil),
      true,
      { algorithm: ENV.fetch('JWT_ALGORITHM', nil), verify_expiration: false },
    )
    Rails.logger.info(
      'InviteToApplyPageController#decode_token: ' \
      "Expired JWT #{decoded_token_expired}",
    )
    handle_expired_token(decoded_token_expired)
  rescue JWT::VerificationError
    Rails.logger.info(
      'InviteToApplyPageController#decode_token: ' \
      "Invalid JWT in #{request.original_url}",
    )
    root_url
  end

  def encode_token(expiration, params)
    payload = {
      exp: expiration,
      data: params,
    }
    JWT.encode(payload, ENV.fetch('JWT_TOKEN_SECRET'), ENV.fetch('JWT_ALGORITHM'))
  end

  def handle_expired_token(decoded_token_expired)
    # do not show the deadline-passed page for 'no' responses
    if decoded_token_expired.first.dig('data', 'response') == 'no'
      decoded_token_expired.first['data']
    else
      lang = params[:lang] ? "/#{params[:lang]}" : ''
      "#{lang}/listings/#{params[:id]}/invite-to-apply/deadline-passed"
    end
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
