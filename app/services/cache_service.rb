# service class for pre-fetching + caching salesforce data
class CacheService
  def prefetch_listings(opts = {})
    # refresh oauth_token before beginning
    Force::Request.new.refresh_oauth_token
    # Get cached listings
    @old_listings = Force::ListingService.listings(subset: 'browse')
    # Get latest listings
    @new_listings = Force::ListingService.listings(subset: 'browse', force: true)
    if opts[:refresh_all]
      cache_all_listings
    else
      check_for_listing_updates
    end
  end

  private

  attr_accessor :old_listings, :new_listings

  def cache_all_listings
    new_listings.each { |listing| cache_single_listing(listing) }
  end

  def check_for_listing_updates
    # Check to see if any of the listings have updated since the last cache
    new_listings.each do |listing|
      old_listing = old_listings.find { |l| l['Id'] == listing['Id'] }

      cache_single_listing(listing) unless
        old_listing.present? and !listing_updated?(old_listing, listing)
    end
  end

  def listing_updated?(old_listing, new_listing)
    old_listing['LastModifiedDate'] != new_listing['LastModifiedDate']
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
    image_processor = ListingImageService.new(listing).process_image
    Rails.logger.error image_processor.errors.join(',') if image_processor.errors.present?
  rescue Faraday::ClientError => e
    Raven.capture_exception(e, tags: { 'listing_id' => listing['Id'] })
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
