Sidekiq.configure_server do |config|
  config.redis = { ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }

  config.on(:startup) do
    ::UNLEASH ||= Unleash::Client.new # rubocop:disable Style/RedundantConstantBase, Lint/OrAssignmentToConstant
  end

  config.on(:shutdown) do
    ::UNLEASH.shutdown # rubocop:disable Style/RedundantConstantBase
  end
end

Sidekiq.configure_client do |config|
  config.redis = { ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
end
