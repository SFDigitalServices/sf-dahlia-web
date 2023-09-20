# service class for pre-fetching + caching salesforce data
class CacheService
  def prefetch_listings(opts = {})
    # Refresh OAuth token, to avoid unauthorized errors in case it has expired
    Force::Request.new.refresh_oauth_token
    @prev_cached_listings = Force::ListingService.listings(subset: 'browse')
    @fresh_listings = Force::ListingService.listings(subset: 'browse', force: true)

    if opts[:refresh_all]
      cache_all_listings
    else
      cache_only_updated_listings
    end
    Rails.logger.info('Cache Service Finished')
  end

  private

  attr_accessor :prev_cached_listings, :fresh_listings

  def cache_listing_images
    ENV['CACHE_LISTING_IMAGES'].to_s.casecmp('true').zero?
  end

  def cache_all_listings
    fresh_listings.each { |l| cache_single_listing(l) }
  end

  def cache_only_updated_listings
    # TODO: consider adding logging for how many items to process in a given run of the
    # cache service
    fresh_listings.each do |fresh_listing|
      prev_cached_listing = prev_cached_listings.find do |l|
        l['Id'] == fresh_listing['Id']
      end

      # TODO: find a differnt way to determin if listing is unchanged. This function seems to always return true.
      unless listing_unchanged?(prev_cached_listing, fresh_listing)
        Rails.logger.info("Listing is changed #{prev_cached_listing['Id']}")
      end

      cache_single_listing(fresh_listing)
    end
  end

  def listing_unchanged?(prev_cached_listing, fresh_listing)
    prev_cached_listing.present? &&
      (prev_cached_listing['LastModifiedDate'] == fresh_listing['LastModifiedDate'])
  end

  def cache_single_listing(listing)
    id = listing['Id']
    # cache this listing from API
    Force::ListingService.listing(id, force: true)
    Force::ListingService.units(id, force: true)
    Force::ListingService.preferences(id, force: true)
    Force::ListingService.lottery_buckets(id, force: true) if listing_closed?(listing)
    # NOTE: there is no call to Force::ListingService.ami
    # because it is parameter-based and values will rarely change (1x/year?)
    cache_listing_images && process_listing_images(listing)
  rescue Faraday::ClientError => e
    Raven.capture_exception(e, tags: { 'listing_id' => listing['Id'] })
  end

  def process_listing_images(listing)
    Rails.logger.info("Calling ListingImageService for #{listing['Id']} ")
    image_processor = ListingImageService.new(listing).process_image
    Rails.logger.error image_processor.errors.join(',') if image_processor.errors.present?
    Rails.logger.info("Calling MultipleListingImageService for #{listing['Id']} ")
    multiple_listing_image_processor = MultipleListingImageService.new(listing).process_images
    Rails.logger.error multiple_listing_image_processor.errors.join(',') if multiple_listing_image_processor.errors.present?
  end

  def listing_closed?(listing)
    begin
      due_date_passed = Date.parse(listing['Application_Due_Date']) < Date.today
    rescue ArgumentError => e
      raise e unless e.message == 'invalid date'

      # if date is invalid, assume we do need to get lottery results
      due_date_passed = true
    end
    due_date_passed
  end
end
