web: bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq -C config/sidekiq.yml
# TODO: switch listener task back to `subscribe` after we are done logging translate usage
# listener: bundle exec rake translate:subscribe
listener: bundle exec rake translate:log_usage
release: bundle exec rake preload:user && bundle exec rake db:migrate
