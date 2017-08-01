# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'
# cache for 1 year
Rails.application.config.static_cache_control = 'public, max-age=31536000'

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder
# are already added.
# Rails.application.config.assets.precompile += %w( search.js )
