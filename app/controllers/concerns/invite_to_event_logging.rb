# Structured logging for invite-to (I2A/I2I) response events. Every recording,
# suppression, and shadow-mode human-verification emits one line with a stable prefix and
# a JSON payload, so Papertrail can group by `outcome`/`reason` and correlate the three log
# sites by `request_id` rather than by timestamp adjacency on a shared dyno.
module InviteToEventLogging
  extend ActiveSupport::Concern

  INVITE_EVENT = 'invite_to.response'.freeze

  # Longest string logged for any single field. Bounded centrally rather than per call
  # site so a newly added field can't reintroduce the gap.
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
end
