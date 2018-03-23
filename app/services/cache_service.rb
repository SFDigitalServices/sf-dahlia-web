# service class for pre-fetching + caching salesforce data
class CacheService
  def prefetch_listings(opts = {})
    if opts[:refresh_all]
      # on daily run, don't grab old listings for comparison
      # to force cache write for all listings
      @old_listings = []
    else
      # grab previous cached result
      @old_listings = Force::ListingService.raw_listings
    end
    # refresh oauth_token before beginnning
    Force::Request.new.refresh_oauth_token
    @new_listings = Force::ListingService.raw_listings(refresh_cache: true)
    check_listings
  end

  private

  attr_accessor :old_listings, :new_listings

  def check_listings
    new_listings.each do |listing|
      id = listing['Id']
      old = old_listings.find { |l| l['Id'] == id }
      unchanged = false
      if old.present?
        old = Force::ListingService.array_sort!(old)
        listing = Force::ListingService.array_sort!(listing)
        # NOTE: This comparison isn't perfect, as the browse listings API endpoint doesn't
        # contain some relational data e.g. some individual unit/preference details.
        # That's why we more aggressively re-cache open listings.
        unchanged = HashDiff.diff(old, listing).empty?
      end
      maybe_cache_listing(listing, unchanged)
    end
  end

  def maybe_cache_listing(listing, unchanged)
    begin
      due_date_passed = Date.parse(listing['Application_Due_Date']) < Date.today
    rescue ArgumentError => e
      raise e unless e.message == 'invalid date'
      # if date is invalid, assume we do need to get lottery results
      due_date_passed = true
    end
    # move on if there is no difference between the old and new listing object
    # but always refresh open listings
    cache_single_listing(listing, due_date_passed) unless unchanged && due_date_passed
  end

  def cache_single_listing(listing, due_date_passed = true)
    id = listing['Id']
    # cache this listing from API
    Force::ListingService.listing(id)
    Force::ListingService.units(id)
    Force::ListingService.preferences(id)
    Force::ListingService.lottery_buckets(id) if due_date_passed
    # NOTE: there is no call to Force::ListingService.ami
    # because it is parameter-based and values will rarely change (1x/year?)
    image_processor = ListingImageService.new(listing).process_image
    Rails.logger.error image_processor.errors.join(',') if image_processor.errors.present?
  rescue Faraday::ClientError => e
    Raven.capture_exception(e, tags: { 'listing_id' => listing['Id'] })
  end
end
