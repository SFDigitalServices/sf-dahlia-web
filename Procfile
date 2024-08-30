web: ./web-tasks.sh
worker: bundle exec sidekiq -C config/sidekiq.yml
release: bundle exec rake db:migrate
