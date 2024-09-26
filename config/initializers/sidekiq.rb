Sidekiq.configure_server do |config|
  config.redis = { ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }

  config.on(:startup) do
    Rails.configuration.unleash = Unleash::Client.new
  end

  config.on(:shutdown) do
    Rails.configuration.unleash.shutdown
  end
end

Sidekiq.configure_client do |config|
  config.redis = { ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
end
