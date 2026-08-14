# Structured logging for invite-to (I2A/I2I) response events.
#
# Every recording, suppression, and shadow-mode human-verification emits a single
# line with a stable prefix and a JSON payload at the end, so Papertrail (and
# scripts/parse-invite-to-logs.js) can group by `outcome`/`reason` and correlate
# the three log sites by `request_id` instead of guessing from timestamp
# adjacency on a shared dyno.
module InviteToEventLogging
  extend ActiveSupport::Concern

  INVITE_EVENT = 'invite_to.response'.freeze

  private

  # outcome: 'recorded' | 'suppressed'
  # source:  'get' (server GET) | 'client_shadow' (shadow-mode human-detection)
  # fields:  any additional k/v; nils are dropped so blank/nil stop reading differently.
  #
  # The line is `invite_to.response {json}` - a greppable prefix plus a JSON blob
  # Papertrail can parse for structured querying.
  def log_invite_event(outcome:, source:, **fields)
    payload = {
      event: INVITE_EVENT,
      outcome: outcome,
      source: source,
      request_id: request.request_id,
    }.merge(fields).compact

    Rails.logger.info("#{INVITE_EVENT} #{payload.to_json}")
  end
end
