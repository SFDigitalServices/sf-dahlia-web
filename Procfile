web: bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq -C config/sidekiq.yml
listener: bundle exec rake translate:subscribe
release: bundle exec rake db:migrate
