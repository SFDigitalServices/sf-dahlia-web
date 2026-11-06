# frozen_string_literal: true

module Rack
  # Site-wide kill switch. When the MAINTENANCE_FLAG Unleash flag is on for a request's
  # IP, it gets a 503. Testers' IPs are excluded with a `remoteAddress NOT_IN` constraint
  # on the flag, so a release can be tested while the site is down. Like other flags, it
  # uses Unleash's last-known value if Unleash is down; restart dynos to clear it.
  # Must run after ActionDispatch::RemoteIp so remote_ip reflects X-Forwarded-For.
  class MaintenanceMode
    MAINTENANCE_FLAG = 'perm.webapp.maintenance-mode'
    # tells crawlers the outage is temporary (so pages aren't deindexed) and when to retry
    RETRY_AFTER_SECONDS = '3600'

    def initialize(app)
      @app = app
    end

    def call(env)
      request = ActionDispatch::Request.new(env)
      return @app.call(env) unless maintenance_mode?(request)

      headers = { 'Retry-After' => RETRY_AFTER_SECONDS }
      # axios/$http send browser-like Accept headers that Rails reads as HTML
      if request.format.html? && !request.path.start_with?('/api/')
        headers['Content-Type'] = 'text/html; charset=utf-8'
        body = ::File.read(Rails.public_path.join('503.html'))
      else
        headers['Content-Type'] = 'application/json; charset=utf-8'
        body = { message: 'Service Unavailable', status: 503 }.to_json
      end
      # we run before Rack::Head, so drop the body ourselves
      [503, headers, request.head? ? [] : [body]]
    end

    private

    def maintenance_mode?(request)
      context = Unleash::Context.new(remote_address: request.remote_ip)
      Rails.configuration.unleash.is_enabled?(MAINTENANCE_FLAG, context)
    rescue StandardError
      false
    end
  end
end
