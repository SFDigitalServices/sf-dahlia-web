# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'

require_relative '../lib/rack_x_robots_tag'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module SfDahliaWeb
  # setting up config for application
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    config.assets.paths << Rails.root.join('lib', 'assets', 'bower_components')
    config.assets.paths << Rails.root.join('app', 'assets', 'json', 'translations')
    config.assets.paths << Rails.root.join('app', 'assets', 'json', 'translations', 'react')

    # http://guides.rubyonrails.org/action_mailer_basics.html#previewing-emails
    config.action_mailer.preview_path = "#{Rails.root}/lib/mailer_previews"

    config.time_zone = 'Pacific Time (US & Canada)'

    # Configure i18n

    # Whitelist locales available for the application
    I18n.available_locales = %i[en es tl zh]

    # Set fallbacks
    config.i18n.default_locale = :en
    config.i18n.fallbacks = [:en]

    # Set locale files
    config.i18n.load_path += Dir[Rails.root.join('app', 'assets', 'json', 'translations', 'locale-*.json')]

    # set up ActiveJob to use Sidekiq
    # if ENV['SIDEKIQ'] is not specified, will use default inline processor
    config.active_job.queue_adapter = :sidekiq if ENV['SIDEKIQ']

    if ENV['PRERENDER_TOKEN'].present?
      config.middleware.use Rack::Prerender, prerender_token: ENV['PRERENDER_TOKEN']
    elsif ENV['PRERENDER_SERVICE_URL'].present?
      config.middleware.use Rack::Prerender, prerender_service_url: ENV['PRERENDER_SERVICE_URL']
    end

    ENV['GEOCODING_SERVICE_URL'] ||= 'https://sfgis-portal.sfgov.org/svc/rest/services/dahlia/NHRP_Composite/GeocodeServer/findAddressCandidates'
    ENV['NEIGHBORHOOD_BOUNDARY_SERVICE_URL'] ||= 'https://sfgis-portal.sfgov.org/svc/rest/services/dahlia/NRHP_pref/MapServer/0/query'

    config.middleware.use Rack::XRobotsTag
    # write cached robots.txt into public dir
    config.action_controller.page_cache_directory = "#{Rails.root}/public"

    # for serving gzipped assets
    config.middleware.use Rack::Deflater

    # remove trailing slashes
    # https://stackoverflow.com/a/3570233/260495
    config.middleware.insert_before(Rack::Runtime, Rack::Rewrite) do
      r301 %r{(.+)/$}, '$1'
      r301 %r{(.+)/\?(.*)$}, '$1?$2'
      r301 '/mohcd-plus-housing', 'https://sfmohcd.org/plus-housing-application'
    end

    # Disables the deprecated #to_s override in some Ruby core classes
    # See https://guides.rubyonrails.org/configuring.html#config-active-support-disable-to-s-conversion for more information.
    config.active_support.disable_to_s_conversion = true

    # Rails 7 can protect from open redirect attacks in `redirect_back_or_to` and `redirect_to`.
    # This is not compatible with our authentication process so we disable it
    config.action_controller.raise_on_open_redirects = false
  end
end
