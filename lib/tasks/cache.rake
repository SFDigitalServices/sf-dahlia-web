namespace :cache do
  desc 'Clear all cached files and requests'
  task clear_all: :environment do
    Rails.cache.clear
  end

  desc 'Pre-fetch all listings for caching'
  task prefetch: :environment do
    CacheService.cache_all_listings(daily: false)
  end
  task prefetch_daily: :environment do
    CacheService.cache_all_listings(daily: true)
  end
end
