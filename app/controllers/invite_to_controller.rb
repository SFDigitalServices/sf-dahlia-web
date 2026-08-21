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

    @invite_to_props = props(decoded_params)
    # Get URL from application
    if decoded_params['appId'].present? || decoded_params['applicationNumber'].present?
      application = Force::ShortFormService.get(decoded_params['appId'] || decoded_params['applicationNumber'])
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

  # 'off' = client hook inert. 'shadow' = server still records on GET, client only logs its
  # human-detection result. A client-records 'on' state waits on PR #2993.
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

    reason = suppression_reason(invite_action, deadline, is_test)
    if reason
      log_invite_event(
        outcome: 'suppressed',
        source: 'get',
        reason: reason,
        **deadline_terms(deadline, reason),
        # language_change? can silently eat a legitimate first click, so make it auditable.
        referrer: (reason == 'language_change' ? scrubbed_referrer : nil),
        deadline: deadline,
        app_id: app_id,
        act: invite_action,
        is_test: is_test,
      )
      return
    end

    # nil on both the invalid-action guard and any rescued error, so ok= below means
    # "attempted and not swallowed", not a confirmed Salesforce write.
    result = DahliaBackend::MessageService.send_invite_to_response(
      app_id,
      invite_action,
    )

    log_invite_event(
      outcome: 'recorded',
      source: 'get',
      ok: !result.nil?,
      deadline: deadline,
      # Should never be true: a blank deadline means the expiry check was skipped
      # entirely. Flagged rather than suppressed so a real response is never dropped.
      deadline_missing: (true if deadline.blank?),
      app_id: app_id,
      act: invite_action,
      is_test: is_test,
    )
  end

  # Order matches the original `||` precedence: a preview link (act blank) is `no_action`.
  def suppression_reason(invite_action, deadline, is_test)
    if invite_action.blank? then 'no_action'
    # `.present?` keeps a blank deadline out of deadline_has_passed?, which would report
    # it as passed. Blank falls through to recording, as it did before.
    elsif deadline.present? && deadline_has_passed?(deadline) then 'deadline_passed'
    elsif language_change? then 'language_change'
    elsif is_test then 'test_link'
    end
  end

  # What the code actually compared, in resolved local terms. A `late_by` under a minute
  # points at a clock/UX issue rather than a genuinely late response.
  def deadline_terms(deadline, reason)
    return {} unless reason == 'deadline_passed' && deadline.present?

    # Time.zone.parse returns nil for input it cannot parse, which the rescue won't catch.
    deadline_time = Time.zone.parse(deadline)
    return { deadline_raw: deadline } if deadline_time.nil?

    {
      deadline_date: deadline_time.to_date.to_s,
      today: Time.zone.today.to_s,
      late_by: format_duration((Time.zone.now - deadline_time).to_i),
    }
  rescue ArgumentError, TypeError
    { deadline_raw: deadline } # unparseable - surface it rather than crash the log line
  end

  # The referrer here is always another next-steps URL, which carries the invite JWT in
  # `?t=`. Keep only scheme/host/path so live tokens never reach the logs.
  def scrubbed_referrer
    referrer = request.referrer
    return nil if referrer.blank?

    uri = URI.parse(referrer)
    uri.query = nil
    uri.fragment = nil
    uri.to_s
  rescue URI::InvalidURIError
    '[unparseable]'
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

  # Time.zone.parse returns nil for some malformed input and raises on the rest, either of
  # which previously 500'd the page. A deadline we cannot verify counts as passed.
  def deadline_has_passed?(deadline)
    parsed = Time.zone.parse(deadline.to_s)
    return true if parsed.nil?

    parsed.to_date < Time.zone.today
  rescue ArgumentError, TypeError
    true
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
