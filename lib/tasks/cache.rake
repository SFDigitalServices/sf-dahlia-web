namespace :cache do
  desc 'Clear all cached files and requests'
  task clear_all: :environment do
    Rails.cache.clear
  end

  desc 'Pre-fetch all listings, rental listings, and ownership listings, for caching'
  task prefetch: :environment do
    Force::Request.new(parse_response: true)
                  .cached_get('/ListingDetails', { type: 'rental' }, false)
    Force::Request.new(parse_response: true)
                  .cached_get('/ListingDetails', { type: 'ownership' }, false)
    CacheService.new.prefetch_listings(refresh_all: false)
  end
  task prefetch_daily: :environment do
    Force::Request.new(parse_response: true)
                  .cached_get('/ListingDetails', { type: 'rental' }, true)
    Force::Request.new(parse_response: true)
                  .cached_get('/ListingDetails', { type: 'ownership' }, true)
    CacheService.new.prefetch_listings(refresh_all: true)
  end
end
