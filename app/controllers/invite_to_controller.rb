# Invite to X controller
class InviteToController < ApplicationController
  include InviteToEventLogging

  CLIENT_RECORDING_FLAG = 'temp.webapp.inviteToClientRecording'

  before_action :ignore_head_requests

  def index
    decoded_params = decode_token(params[:t])
    if decoded_params.is_a?(String)
      redirect_to decoded_params
      return
    end
    # TODO: remove the `params` fallback once we are sure that all links are using the token

    decoded_params ||= params
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
      submitPreviewLinkTokenParam: encode_token(url_params.except(:act, :response)),
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
    response = decoded_params['response']
    application_number = decoded_params['applicationNumber']
    invite_action = decoded_params['act']
    app_id = decoded_params['appId']
    is_test = ActiveModel::Type::Boolean.new.cast(decoded_params['isTest']) == true

    reason = suppression_reason(invite_action, response, deadline, is_test)
    if reason
      log_invite_event(
        outcome: 'suppressed',
        source: 'get',
        reason: reason,
        # Resolved local comparison terms, only set when the deadline is the reason.
        **deadline_terms(deadline, reason),
        # The one suppression that can silently eat a legitimate first click; capture what
        # request.referrer actually was so language_change? can be audited.
        referrer: (reason == 'language_change' ? request.referrer : nil),
        deadline: deadline,
        app_id: app_id,
        act: invite_action,
        is_test: is_test,
      )
      return
    end

    # send_invite_to_response returns nil on both the invalid-action guard and any
    # rescued StandardError, so a non-nil result means "attempted and not
    # swallowed", not a confirmed Salesforce write. Surfacing ok=false is still
    # enough to tell a hiccup from a clean send.
    result = DahliaBackend::MessageService.send_invite_to_response(
      deadline,
      app_id,
      application_number,
      response,
      invite_action,
      params['id'], # listing_id
    )

    log_invite_event(
      outcome: 'recorded',
      source: 'get',
      ok: !result.nil?,
      deadline: deadline,
      app_id: app_id,
      act: invite_action,
      is_test: is_test,
    )
  end

  # Names the single reason a GET is not recorded instead of collapsing four
  # causes into one branch. Order matches the original `||` precedence: a preview
  # link (act blank) is `no_action`.
  def suppression_reason(invite_action, response, deadline, is_test)
    if invite_action.blank? && response.blank? then 'no_action'
    elsif deadline && deadline_has_passed?(deadline) then 'deadline_passed'
    elsif language_change? then 'language_change'
    elsif is_test then 'test_link'
    end
  end

  # Emits what the code actually compared, in resolved local terms, with a
  # near-miss delta: late_by under an hour is a product conversation, under a
  # minute is likely a clock/UX issue.
  def deadline_terms(deadline, reason)
    return {} unless reason == 'deadline_passed' && deadline.present?

    deadline_time = Time.zone.parse(deadline)
    {
      deadline_date: deadline_time.to_date.to_s,
      today: Time.zone.today.to_s,
      late_by: format_duration((Time.zone.now - deadline_time).to_i),
    }
  rescue ArgumentError, TypeError
    { deadline_raw: deadline } # unparseable - surface it rather than crash the log line
  end

  # Compact human duration ("2m", "3h", "5d") without pulling in a gem.
  def format_duration(seconds)
    seconds = seconds.abs
    return "#{seconds}s" if seconds < 60
    return "#{seconds / 60}m" if seconds < 3600
    return "#{seconds / 3600}h" if seconds < 86_400

    "#{seconds / 86_400}d"
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
