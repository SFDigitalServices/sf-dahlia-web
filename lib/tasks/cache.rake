namespace :cache do
  desc 'Clear all cached files and requests'
  task clear_all: :environment do
    Rails.cache.clear
  end
end
