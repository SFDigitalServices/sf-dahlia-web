# Controller for the page shown when applicants are invited to interview (100% affordable)
class InviteToInterviewPageController < ApplicationController
  def index
    decoded_params = use_jwt? && decode_token(params[:t])
    if decoded_params.is_a?(String)
      redirect_to decoded_params
      return
    end

    decoded_params ||= params
    @invite_to_interview_props = props(decoded_params)
    render 'invite_to_interview'
  end

  def documents
    @invite_to_interview_props = {
      assetPaths: static_asset_paths,
      documentsPath: true,
    }
    render 'invite_to_interview'
  end

  private

  def props(decoded_params = params)
    url_params = {
      deadline: decoded_params['deadline'],
      response: decoded_params['response'],
      applicationNumber: decoded_params['applicationNumber'],
    }

    {
      assetPaths: static_asset_paths,
      urlParams: url_params,
      submitPreviewLinkTokenParam: encode_token(url_params.except(:response)),
    }.compact
  end

  def decode_token(token)
    if token.blank?
      return url_for(
        controller: 'listing', id: params[:id], lang: params[:lang],
      )
    end

    decoded_token = JWT.decode(
      token,
      ENV.fetch('JWT_TOKEN_SECRET', nil),
      true,
      { algorithm: ENV.fetch('JWT_ALGORITHM', nil), verify_expiration: false },
    )
    decoded_token.first['data']
  rescue JWT::VerificationError
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

  def use_jwt?
    Rails.configuration.unleash.is_enabled?('temp.webapp.inviteToApply.JwtLinkParams') &&
      ENV.fetch('JWT_TOKEN_SECRET', nil) &&
      ENV.fetch('JWT_ALGORITHM', nil)
  end

  def use_react_app
    true
  end
end
