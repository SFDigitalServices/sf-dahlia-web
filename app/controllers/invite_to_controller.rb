# Invite to X controller
class InviteToController < ApplicationController
  CLIENT_RECORDING_FLAG = 'temp.webapp.inviteToClientRecording'

  before_action :ignore_head_requests

  def index
    decoded_params = decode_token(params[:t])
    if decoded_params.is_a?(String)
      redirect_to decoded_params
      return
    end

    @invite_to_props = props(decoded_params)
    # Get URL from application
    if decoded_params['appId'].present? || decoded_params['applicationNumber'].present?
      application = Force::ShortFormService.get(decoded_params['appId'] || decoded_params['applicationNumber'])
      @invite_to_props = @invite_to_props.merge(
        uploadUrl: application['uploadURL'],
        schedulingUrl: application['leaseupAppointmentSchedulingURL'],
      )
    end
    # Recording always happens server-side on GET for now. When the flag is enabled the
    # client additionally runs its human-detection in parallel and logs only ('shadow'),
    # so we can measure bot vs. human clicks against real traffic. Moving the recording
    # to the client is deferred until
    # https://github.com/SFDigitalServices/sf-dahlia-web/pull/2993 lands.
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

  # Deprecated I2A pilot - remove references to applicationNumber and response in DAH-4045
  def props(decoded_params = params)
    url_params = {
      type: decoded_params['type'],
      deadline: decoded_params['deadline'],
      act: decoded_params['act'] || decoded_params['response'],
      appId: decoded_params['appId'] || decoded_params['applicationNumber'],
      isTest: ActiveModel::Type::Boolean.new.cast(decoded_params['isTest']) == true,
    }

    {
      assetPaths: static_asset_paths,
      urlParams: url_params,
      clientRecordingMode: client_recording_mode,
      submitPreviewLinkTokenParam: encode_token(url_params.except(:act)),
    }.compact
  end

  # Resolves the rollout state of the client-side recording feature from the
  # 'temp.webapp.inviteToClientRecording' Unleash flag:
  #   flag disabled -> 'off'    (client hook inert)
  #   flag enabled  -> 'shadow' (server records on GET; client detects humans, logs only)
  # There is deliberately no 'on' (client-records) state yet - see PR #2993.
  def client_recording_mode
    return @client_recording_mode if defined?(@client_recording_mode)

    @client_recording_mode =
      Rails.configuration.unleash.is_enabled?(CLIENT_RECORDING_FLAG) ? 'shadow' : 'off'
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
      "act=#{invite_action.inspect}, " \
      "is_test=#{is_test}",
    )

    DahliaBackend::MessageService.send_invite_to_response(
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
    #       "appId" => "12345678",
    #       "isTest" => false
    #     },
    #     "iat" => 946512000
    #    },
    #   {"alg" => "HS256", "typ" => "JWT"}
    # ]

    decoded_token = JsonWebTokenService.decode_token(token)
    Rails.logger.info(
      'InviteToController#decode_token: ' \
      'Decoded JWT Success',
    )
    decoded_token
  rescue JsonWebTokenService::InvalidTokenError => e
    Rails.logger.info(
      'InviteToController#decode_token: ' \
      "Invalid JWT in #{request.original_url}: #{e.message}",
    )
    root_url
  end

  def encode_token(params)
    JsonWebTokenService.encode_token(params)
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
