namespace :cache do
  desc 'Clear all cached files and requests'
  task clear_all: :environment do
    Rails.cache.clear
  end

  desc 'Pre-fetch all listings for caching'
  task prefetch: :environment do
    CacheService.prefetch_listings(refresh_all: false)
  end
  task prefetch_daily: :environment do
    CacheService.prefetch_listings(refresh_all: true)
  end
end
