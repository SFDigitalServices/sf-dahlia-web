require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module SfDahliaWeb
  # setting up config for application
  class Application < Rails::Application
    config.assets.paths << Rails.root.join('lib', 'assets', 'bower_components')
  end
end
