Unleash.configure do |config|
  config.app_name = 'webapp'
  config.url      = ENV.fetch('UNLEASH_URL', nil)
  config.logger   = Rails.logger
  config.custom_http_headers = { Authorization: ENV.fetch('UNLEASH_TOKEN_RAILS', nil) }
  # this needs to be explicitly set, otherwise the toggle fetcher never re-fetches,
  #   might be an Unleash SDK bug
  config.refresh_interval = 15
end

::UNLEASH = Unleash::Client.new # rubocop:disable Style/RedundantConstantBase
