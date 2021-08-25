source 'https://rubygems.org'
ruby '2.5.3'

# same method is used in https://github.com/rails/rails/blob/master/Gemfile
git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem 'rails', '~> 5.2.5'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Slim templates generator for Rails 3 and 4
gem 'slim-rails'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '~> 3.2'
# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails'
# Add ability to generate source maps in Sprockets
gem 'sprockets_uglifier_with_source_maps'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer',  platforms: :ruby
gem 'puma', '~> 4.3.8'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.8.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

# takes care of importing javascript dependencies
# see /bower.json for more info
gem 'bower-rails'
# Adds HTML templates into Angular's $templateCache using asset pipeline.

# angular-rails-templates > 1.0.0 now compatible with sprockets > 3.0
gem 'angular-rails-templates'

# Javascript packages pre-processor
gem "webpacker", "~> 5.2.1"
gem "webpacker-react", "~> 0.3.2"

# salesforce
gem 'restforce', '~>3.1.0', require: false

# handy ruby extensions
gem 'facets', require: false

gem 'rack', '>= 2.2.3'
# for redirecting
gem 'rack-rewrite', '~> 1.5.0'
# for CORS requests (specifically for CDN handling)
gem 'rack-cors', '~> 1.0.5'

# address validation
gem 'easypost', '>=3.0.1'
gem 'StreetAddress', github: 'Exygy/street-address', require: 'street_address'

# JSON optimization
gem 'oj'
gem 'oj_mimic_json'

# user authentication
# Note: devise 4.7.2 is unverified and causes undefined method `rails51?' errors.
gem 'devise', '4.7.1'
gem 'devise_token_auth', '~> 1.1.4'

# postgresql database
gem 'pg'

gem 'actionmailer-text'

gem 'hashie'

gem 'sitemap_generator', github: 'Exygy/sitemap_generator'

gem 'nokogiri', '>= 1.10.10'
gem 'actionpack-page_caching', '~> 1.2.2'


# image manipulation
gem 'mini_magick', '~> 4.9.4'
gem 'image_optimizer', '~> 1.7.0'

gem 'prerender_rails', '~> 1.6.0'

# http requests made easy
gem 'http', '~> 2.0.2', require: false

gem 'sidekiq', '~> 5.0.2'

gem 'hashdiff', '~> 0.3.0'

gem 'fog-aws'

# https://elements.heroku.com/addons/sentry
gem 'sentry-raven', '~> 2.6.3'

group :test do
  gem 'codeclimate-test-reporter', '= 0.6.0'

  # Provide some testing functions that were removed in Rails 5
  gem 'rails-controller-testing'

  gem 'webmock'
  gem 'vcr'
end

group :development do
  gem 'rubocop', '~> 0.52.0', require: false
  gem 'rails_best_practices'
  gem 'overcommit'
  # Spring speeds up development by keeping your application running in the
  # background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'better_errors'
end

group :development, :test do
  gem 'rspec-rails'
  gem 'rspec-core'
  gem 'shoulda-matchers'
  gem 'factory_bot_rails'
  gem 'awesome_print'
  gem 'dotenv-rails'
  gem 'jquery-rails' # only needed for jasmine-jquery
  gem 'jasmine'
  gem 'jasmine-jquery-rails' # used for functions like `getJSONFixture`
  gem 'phantomjs', '~> 2.1.1'
  gem 'pry-byebug'
  gem 'pry-rails'
  gem 'binding_of_caller'
  gem 'database_cleaner'
  gem 'foreman'
end

group :production do
  gem 'newrelic_rpm'
  gem 'dalli'
  gem 'memcachier'
  gem 'heroku-deflater', github: 'Exygy/heroku-deflater'
  gem 'rails_autoscale_agent'
end
