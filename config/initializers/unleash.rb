Unleash.configure do |config|
  config.app_name = 'webapp'
  config.url      = ENV.fetch('UNLEASH_URL', nil)
  config.logger   = Rails.logger
  config.custom_http_headers = { Authorization: ENV.fetch('UNLEASH_TOKEN_RAILS', nil) }
end

Rails.configuration.unleash = Unleash::Client.new
