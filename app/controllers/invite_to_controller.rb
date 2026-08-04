# Invite to X controller
class InviteToController < ApplicationController
  before_action :ignore_head_requests

  def index
    decoded_params = decode_token(params[:t])
    if decoded_params.is_a?(String)
      redirect_to decoded_params
      return
    end
    decoded_params ||= params
    @invite_to_props = props(decoded_params)
    # Get URL from application
    if decoded_params['appId'].present?
      application = Force::ShortFormService.get(decoded_params['appId'])
      @invite_to_props = @invite_to_props.merge(
        uploadUrl: application['uploadURL'],
        schedulingUrl: application['leaseupAppointmentSchedulingURL'],
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

  def ignore_head_requests
    return unless request.head?

    Rails.logger.info(
      'InviteToController#ignore_head_requests: ignoring HEAD request ' \
      "action=#{action_name}, " \
      "listing_id=#{params[:id].inspect}, " \
      "url=#{request.original_url.split('?').first}, " \
      "referrer=#{request.referrer&.split('?')&.first.inspect}, " \
      "user_agent=#{request.user_agent.inspect}, " \
      "remote_ip=#{request.remote_ip}",
    )
    head :ok
  end

  def props(decoded_params = params)
    url_params = {
      type: decoded_params['type'],
      deadline: decoded_params['deadline'],
      act: decoded_params['act'],
      appId: decoded_params['appId'],
      isTest: ActiveModel::Type::Boolean.new.cast(decoded_params['isTest']) == true,
    }

    {
      assetPaths: static_asset_paths,
      urlParams: url_params,
      submitPreviewLinkTokenParam: encode_token(url_params.except(:act)),
    }.compact
  end

  def record_response(decoded_params)
    deadline = decoded_params['deadline']
    invite_action = decoded_params['act']
    app_id = decoded_params['appId']
    is_test = ActiveModel::Type::Boolean.new.cast(decoded_params['isTest']) == true

    if invite_action.blank? || (deadline && deadline_has_passed?(deadline)) || language_change? || is_test
      Rails.logger.info(
        'InviteToController#record_response: *NOT* recording ' \
        "deadline=#{deadline}, " \
        "app_id=#{app_id}, " \
        "act=#{invite_action.inspect}, " \
        "is_test=#{is_test}",
      )
      return
    end

    Rails.logger.info(
      'InviteToController#record_response: recording ' \
      "deadline=#{deadline}, " \
      "app_id=#{app_id}, " \
      "act=#{invite_action}, " \
      "is_test=#{is_test}",
    )

    DahliaBackend::MessageService.send_invite_to_response(
      deadline,
      app_id,
      invite_action,
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
