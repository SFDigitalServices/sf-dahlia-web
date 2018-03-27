# service class for pre-fetching + caching salesforce data
class CacheService
  def prefetch_listings(opts = {})
    # refresh oauth_token before beginning
    Force::Request.new.refresh_oauth_token
    @old_listings = Force::ListingService.raw_listings
    @new_listings = Force::ListingService.raw_listings(refresh_cache: true)
    if opts[:refresh_all]
      cache_listings
    else
      check_listings
    end
  end

  private

  attr_accessor :old_listings, :new_listings

  def cache_listings
    new_listings.each { |listing| cache_single_listing(listing) }
  end

  def check_listings
    new_listings.each do |listing|
      id = listing['Id']
      old_listing = old_listings.find { |l| l['Id'] == id }
      unchanged = false
      if old_listing.present?
        sorted_old_listing = Force::ListingService.array_sort!(old_listing)
        sorted_listing = Force::ListingService.array_sort!(listing)
        # NOTE: This comparison isn't perfect, as the browse listings API endpoint doesn't
        # contain some relational data e.g. some individual unit/preference details.
        # That's why we more aggressively re-cache open listings.
        unchanged = HashDiff.diff(sorted_old_listing, sorted_listing).empty?
      end
      cache_single_listing(listing) unless unchanged
    end
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
