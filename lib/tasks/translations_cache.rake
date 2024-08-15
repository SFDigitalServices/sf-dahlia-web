namespace :translations_cache do
  desc 'Pre-fetch listing translations for caching for supplied listing ids'
  # TODO: decide how often to recache translations
  task :prefetch_listing_translations, [:listing_ids] => :environment do |_t, args|
    listing_ids = args[:listing_ids].split

    listing_ids.map do |listing_id|
      listing = Force::ListingService.listing(listing_id)
      response = CacheService.new.process_translations(listing)
      puts "Successfully cached translations for #{listing_id}" if response
    end
  end
end
