# service class for pre-fetching + caching salesforce data
class CacheService
  def prefetch_listings(opts = {})
    # Refresh OAuth token, to avoid unauthorized errors in case it has expired
    Force::Request.new.refresh_oauth_token
    Rails.logger.info('CacheService Started')
    @prev_cached_listings = Force::ListingService.listings(subset: 'browse')
    @fresh_listings = Force::ListingService.listings(subset: 'browse', force: true)

    if opts[:refresh_all]
      cache_all_listings
    else
      cache_only_updated_listings
    end
    Rails.logger.info('CacheService Finished')
  end

  private

  attr_accessor :prev_cached_listings, :fresh_listings

  def cache_all_listings
    fresh_listings.each do |l|
      cache_single_listing(l)
      process_listing_images(l)
    end
  end

  def cache_only_updated_listings
    fresh_listings.each do |fresh_listing|
      prev_cached_listing = prev_cached_listings.find do |l|
        l['Id'] == fresh_listing['Id']
      end

      ## todo: remove listing_unchanged because it doesn't work?
      unless listing_unchanged?(prev_cached_listing, fresh_listing) &&
             listing_images_unchanged?(prev_cached_listing, fresh_listing)
        cache_single_listing(fresh_listing)
      end

      process_listing_images(fresh_listing)
    end
  end

  def listing_unchanged?(prev_cached_listing, fresh_listing)
    changed = prev_cached_listing.present? &&
              (prev_cached_listing['LastModifiedDate'] == fresh_listing['LastModifiedDate'])
    Rails.logger.info("Listing_unchanged for #{fresh_listing['Id']} is #{changed}")

    changed
  end

  def listing_images_equal?(prev_cached_listing_images, fresh_listing_images)
    fresh_li_slice = fresh_listing_images&.map { |li| li.slice('Id', 'Image_URL') }
    prev_li_slice = prev_cached_listing_images&.map { |li| li.slice('Id', 'Image_URL') }
    (fresh_li_slice - prev_li_slice).empty? && (prev_li_slice - fresh_li_slice).empty?
  end

  def listing_images_unchanged?(prev_cached_listing, fresh_listing)
    prev_cached_listing_images = prev_cached_listing&.dig('Listing_Images')
    fresh_listing_images = fresh_listing&.dig('Listing_Images')

    return true if fresh_listing_images.blank?

    notChanged = listing_images_equal?(prev_cached_listing_images, fresh_listing_images)
    Rails.logger.info("Listing_images_equal for #{fresh_listing['Id']} is #{notChanged}")
    notChanged
  end

  def cache_single_listing(listing)
    Rails.logger.info("Calling cache_single_listing for #{listing['Id']}")

    id = listing['Id']
    # cache this listing from API
    Force::ListingService.listing(id, force: true)
    Force::ListingService.units(id, force: true)
    Force::ListingService.preferences(id, force: true)
    Force::ListingService.lottery_buckets(id, force: true) if listing_closed?(listing)
    # NOTE: there is no call to Force::ListingService.ami
    # because it is parameter-based and values will rarely change (1x/year?)
  rescue Faraday::ClientError => e
    Raven.capture_exception(e, tags: { 'listing_id' => listing['Id'] })
  end

  def process_listing_images(listing)
    Rails.logger.info("Calling MultipleListingImageService #{listing['Id']}")
    multiple_listing_image_processor = MultipleListingImageService.new(listing).process_images
    return unless multiple_listing_image_processor&.errors.present?

    Rails.logger.error multiple_listing_image_processor.errors.join(',')
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
