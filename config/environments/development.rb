Rails.application.configure do
  # Settings specified here will take precedence over those in
  # config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false

  # required for devise
  host = ENV.fetch('LOCALHOST') { 'localhost' }
  config.action_mailer.default_url_options = { host: host, port: 3000 }

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Suppress output of asset requests
  config.assets.quiet = true

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Adds additional error checking when serving assets at runtime.
  # Checks for improperly declared sprockets dependencies.
  # Raises helpful error messages.
  config.assets.raise_runtime_errors = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem
  # config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  # Turn caching on for development
  if Rails.root.join('tmp/caching-dev.txt').exist?
    config.action_controller.perform_caching = true
    config.public_file_server.headers = {
      'Cache-Control' => 'public, max-age=172800',
    }

    # These numbers are from the recommended dalli config: https://devcenter.heroku.com/articles/memcachier#ruby
    config.cache_store = :mem_cache_store, nil, {
      socket_timeout: 1.5,       # default is 0.5
      socket_failure_delay: 0.2, # default is 0.01
    }
  else
    config.action_controller.perform_caching = false
    config.cache_store = :null_store
  end
end
