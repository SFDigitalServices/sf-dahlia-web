# Structured logging for invite-to (I2A/I2I) response events. Every recording,
# suppression, and shadow-mode human-verification emits one line with a stable prefix and
# a JSON payload, so Papertrail can group by `outcome`/`reason` and correlate the three
# log sites by `request_id` rather than by timestamp adjacency on a shared dyno.
module InviteToEventLogging
  extend ActiveSupport::Concern

  INVITE_EVENT = 'invite_to.response'.freeze

  # Caps how long any single logged value can be. Doing it here, rather than at each
  # call site, means a field someone adds later is capped automatically without having
  # to remember to do it.
  VALUE_MAX = 256

  private

  # Emits `invite_to.response {json}`.
  # outcome: 'recorded' | 'suppressed'
  # source:  'get' (server GET) | 'client_shadow' (shadow-mode human-detection)
  # fields:  any additional k/v; nils are dropped so blank and nil don't read differently.
  def log_invite_event(outcome:, source:, **fields)
    payload = {
      event: INVITE_EVENT,
      outcome: outcome,
      source: source,
      request_id: request.request_id,
    }.merge(fields).compact

    Rails.logger.info("#{INVITE_EVENT} #{bound_values(payload).to_json}")
  end

  # Truncates strings and coerces non-scalars to a bounded string, so a hostile client
  # can't bloat a log line with a huge or deeply nested value.
  def bound_values(value)
    case value
    when Hash then value.transform_values { |v| bound_values(v) }
    when Numeric, TrueClass, FalseClass, NilClass then value
    else value.to_s.truncate(VALUE_MAX)
    end
  end

  # --- payload shaping ---------------------------------------------------------------
  # These exist only to turn raw request values into loggable fields, so they live with
  # log_invite_event rather than in the controller that happens to call them.

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
end
