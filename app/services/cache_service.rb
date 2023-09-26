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

      cache_single_listing(fresh_listing) unless listing_unchanged?(prev_cached_listing,
                                                                    fresh_listing) && listing_images_unchanged?(
                                                                      prev_cached_listing, fresh_listing
                                                                    )
      # Rails.logger.info("Calling process_listing_images for #{fresh_listing['Id']}")

      # cache_listing_images && process_listing_images(fresh_listing)
    end
  end

  def listing_unchanged?(prev_cached_listing, fresh_listing)
    prev_cached_listing.present? &&
      (prev_cached_listing['LastModifiedDate'] == fresh_listing['LastModifiedDate'])
  end

  def listing_images_unchanged?(prev_cached_listing, fresh_listing)
    prev_cached_listing_images = prev_cached_listing.present? && prev_cached_listing['Listing_Images']
    fresh_listing_images = fresh_listing.present? && fresh_listing['Listing_Images']

    return true if fresh_listing_images.blank?
    Rails.logger.info("#{fresh_listing['Id']}: Listing_Images length: Prev: #{prev_cached_listing_images&.length} Fresh: #{fresh_listing_images&.length}")



    return false if prev_cached_listing_images&.length != fresh_listing_images&.length

    unchanged = true
    fresh_listing_images.each_with_index do |li, idx|
      unchanged = listing_image_unchanged?(prev_cached_listing_images[idx], li)
      break unless unchanged
    end
    Rails.logger.info("Listing Images for  #{fresh_listing['Id']} is unchanged: #{unchanged}")
    unchanged
  end

  def listing_image_unchanged?(prev_cached_listing_li, fresh_li)
    prev_cached_listing_li['Image_URL'] == fresh_li['Image_URL']
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
    cache_listing_images && process_listing_images(listing)
  rescue Faraday::ClientError => e
    Raven.capture_exception(e, tags: { 'listing_id' => listing['Id'] })
  end

  def process_listing_images(listing)
    Rails.logger.info("Calling ListingImageService for #{listing['Id']}")
    image_processor = ListingImageService.new(listing).process_image
    Rails.logger.error image_processor.errors.join(',') if image_processor.errors.present?
    Rails.logger.info("Calling MultipleListingImageService #{listing['Id']}")
    multiple_listing_image_processor = MultipleListingImageService.new(listing).process_images
    return unless multiple_listing_image_processor.errors.present?

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
