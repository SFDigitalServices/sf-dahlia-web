require 'unleash'

Unleash.configure do |config|
    config.url                  = 'https://dahlia-feature-service-fbc319c3f542.herokuapp.com/api/'
    config.custom_http_headers  = {'Authorization': '*:development.1ed898f8d91806500407b49632ac78829223930fc03d3c672c261071'}
    config.app_name             = 'webapp_backend'
    config.refresh_interval     = 15
    config.logger               = Rails.logger
    config.log_level            = Logger::DEBUG
end

UNLEASH = Unleash::Client.new