Rails.application.configure do
  # Settings specified here will take precedence over those
  # in config/application.rb.

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Enable Rack::Cache to put a simple HTTP cache in front of your application
  # Add `rack-cache` to your Gemfile before enabling this.
  # For large-scale production use, consider using a caching reverse proxy like
  # nginx, varnish or squid.
  # config.action_dispatch.rack_cache = true

  if ENV['RAILS_LOG_TO_STDOUT'].present?
    logger = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger = ActiveSupport::TaggedLogging.new(logger)
  end

  # Enable serving static files from the `/public` folder
  config.public_file_server.enabled = true

  # cache for 1 year
  config.public_file_server.headers = {
    'Cache-Control' => 'public, max-age=31536000'
  }

  # fix error "ExecJS::RuntimeError: SyntaxError: Unexpected token: name (FileChecksum)"
  config.assets.uglifier = { harmony: true }

  # Compress JavaScripts and CSS.
  config.assets.js_compressor = :uglifier_with_source_maps
  # config.assets.css_compressor = :sass

  # Do not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false

  # Generate digests for assets URLs.
  config.assets.digest = true

  # `config.assets.precompile` and `config.assets.version` have moved to
  # config/initializers/assets.rb

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for nginx

  # Set to :debug to see everything in the log.
  config.log_level = :info

  # Prepend all log lines with the following tags.
  # config.log_tags = [ :subdomain, :uuid ]

  # Use a different logger for distributed setups.
  # config.logger = ActiveSupport::TaggedLogging.new(SyslogLogger.new)

  # Use a different cache store in production.
  # These numbers are from the recommended dalli config: https://devcenter.heroku.com/articles/memcachier#ruby
  config.cache_store = :mem_cache_store, nil, {
    socket_timeout: 1.5,       # default is 0.5
    socket_failure_delay: 0.2, # default is 0.01
  }

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  if ENV['ASSET_HOST']
    config.action_controller.asset_host = ENV['ASSET_HOST']
  end

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to
  # raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = true

  host ||= ENV['MAILER_DOMAIN']
  host ||= ENV['HEROKU_APP_NAME'] ? "#{ENV['HEROKU_APP_NAME']}.herokuapp.com" : nil
  host ||= 'housing.sfgov.org'
  # required for devise
  config.action_mailer.default_url_options = { host: host }

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = [I18n.default_locale]

  # Send deprecation notices to registered listeners.
  config.active_support.deprecation = :notify

  # Disable automatic flushing of the log to improve performance.
  # config.autoflush_log = false

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  # SMTP / Sendgrid settings
  if ENV['SENDGRID_USERNAME']
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address:        'smtp.sendgrid.net',
      port:           '587',
      authentication: :plain,
      user_name:      ENV['SENDGRID_USERNAME'],
      password:       ENV['SENDGRID_PASSWORD'],
      domain:         'heroku.com',
      enable_starttls_auto: true,
    }
  end

  # Force all access to the app over SSL, use Strict-Transport-Security,
  # and use secure cookies.
  if ENV['FORCE_SSL']
    config.force_ssl = true
  end

  if ENV['FORCE_HOUSING_SFGOV_DOMAIN']
    config.middleware.insert_before(Rack::Runtime, Rack::Rewrite) do
      r301 %r{.*}, '//housing.sfgov.org$&', if: Proc.new { |rack_env|
        rack_env['SERVER_NAME'] != 'housing.sfgov.org'
      }
    end
  end
end
