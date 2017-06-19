# service class for pre-caching salesforce listings
class CacheService
  def self.cache_all_listings(opts = {})
    if opts[:daily]
      # on daily run, don't even bother grabbing old listings for comparison
      old_listings = []
    else
      # grab previous cached result
      old_listings = ListingService.listings(nil, false)
    end
    # now set all requests to force cache
    ListingService.force = true
    new_listings = ListingService.listings(nil, false)

    new_listings.each do |listing|
      id = listing['Id']
      old = old_listings.find { |l| l['Id'] == id }
      unchanged = false
      if old.present?
        old = ListingService.array_sort!(old)
        listing = ListingService.array_sort!(listing)
        # NOTE: This comparison is not perfect, as it will not find differences
        # in some relations e.g. individual unit or preference details that may
        # have changed. That's why we more aggressively re-cache open listings.
        unchanged = HashDiff.diff(old, listing).empty?
      end
      begin
        due_date_passed = Date.parse(listing['Application_Due_Date']) < Date.today
      rescue
        due_date_passed = true
      end
      # move on if there is no difference between the old and new listing object
      # but always refresh open listings
      next if unchanged && due_date_passed
      cache_single_listing(id, due_date_passed)
    end

    ListingService.force = false
  end

  def self.cache_single_listing(id, due_date_passed = true)
    # cache this listing from API
    ListingService.listing(id)
    ListingService.units(id)
    ListingService.preferences(id)
    ListingService.lottery_buckets(id) if due_date_passed
    # NOTE: there is no call to ListingService.ami
    # because it is parameter-based and values will rarely change (1x/year?)
  end
end
