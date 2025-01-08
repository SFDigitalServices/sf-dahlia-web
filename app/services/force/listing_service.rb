# frozen_string_literal: true

module Force
  # encapsulate all Salesforce Listing querying functions
  class ListingService
    class InvalidLastModifiedDateError < StandardError; end

    CACHE_KEY_PREFIX = '/ListingDetails/'
    DATE_FORMAT = '%Y-%m-%dT%H:%M:%SZ'
    # get all open listings or specific set of listings by id
    # `ids` is a comma-separated list of ids
    # `type` designates "ownership" or "rental" listings
    # returns cached and cleaned listings
    def self.listings(attrs = {})
      params = {}
      params[:type] = attrs[:type] if attrs[:type].present?
      params[:ids] = attrs[:ids] if attrs[:ids].present?
      force = attrs[:force].present? ? attrs[:force] : false
      get_listings(params:, force_recache: force)
    end

    # get listings with eligibility matches applied
    # filters:
    #  householdsize: n
    #  incomelevel: n
    #  childrenUnder6: n
    def self.eligible_listings(filters)
      results = get_listings(params: filters)
      # sort the matched listings to the top of the list
      results.partition { |i| i['Does_Match'] }.flatten
    end

    # get one detailed listing result by id
    def self.listing(id, opts = {})
      @cache = Rails.cache
      endpoint = "#{CACHE_KEY_PREFIX}#{CGI.escape(id)}"
      force = opts[:force] || false
      Rails.logger.info("Calling self.listing for #{id} with force: #{force}")

      results = Request.new(parse_response: true).cached_get(endpoint, nil, force)
      listing = process_listing_images(results)

      if Rails.configuration.unleash.is_enabled? 'LogGoogleCloudTranslateUsage'
        listing['translations'] = log_listing_translations(listing, opts[:rake_task])
      end

      if Rails.configuration.unleash.is_enabled? 'GoogleCloudTranslate'
        listing['translations'] = get_listing_translations(listing) || {}
      end
      listing
    end

    def self.process_listing_images(results)
      results_with_cached_listing_images = add_cloudfront_urls_for_listing_images(results)
      add_image_urls(results_with_cached_listing_images).first
    end

    def self.get_listing_translations(listing)
      listing_id = listing['Id']
      listing_translations = fetch_listing_translations_from_cache(listing_id)
      if translations_invalid?(listing_translations) ||
         translations_are_outdated?(
           listing_translations[:LastModifiedDate], listing['LastModifiedDate']
         ) ||
         translations_are_missing_lottery_bucket_pref_names?(
           listing, listing_translations
         )
        Rails.logger.info(
          'ListingService ' \
          "Translations are not valid for listing #{listing_id}, " \
          'translating all fields',
        )
        return CacheService.new.process_translations(listing)
      end

      if listing_is_outdated?(listing_translations[:LastModifiedDate],
                              listing['LastModifiedDate'])
        Rails.logger.info(
          'ListingService ' \
          "Listing is outdated for #{listing_id}, " \
          'refreshing the cached listing',
        )
        refresh_listing_cache(listing_id)
      end
      listing_translations
    end

    def self.log_listing_translations(listing, rake_task)
      listing_id = listing['Id']
      listing_translations = fetch_listing_translations_from_cache(listing_id)
      translations_last_modified = listing_translations[:LastModifiedDate]

      # additional timestamps to log potential usage of translating during prefetch rake tasks
      if rake_task == 'prefetch_10min'
        translations_last_modified = listing_translations[:LastModifiedDateForPrefetch10Min]
      elsif rake_task == 'prefetch_daily'
        translations_last_modified = listing_translations[:LastModifiedDateForPrefetchDaily]
      end

      # we can only do the timestamp check since we are not actually translating anything
      # this is okay because the bulk of translations are triggered by the timestamp check
      if translations_are_outdated?(translations_last_modified,
                                    listing['LastModifiedDate'])
        return CacheService.new.log_process_translations(listing, rake_task || 'page_view')
      end

      if listing_is_outdated?(translations_last_modified,
                              listing['LastModifiedDate'])
        refresh_listing_cache(listing_id)
      end
      listing_translations
    end

    def self.translations_invalid?(listing_translations)
      ServiceHelper.listing_field_names_salesforce.any? do |field_name|
        !listing_translations.key?(field_name.to_sym)
      end
    end

    def self.translations_are_outdated?(cache_last_modified, listing_last_modified)
      parse_time(cache_last_modified) < parse_time(listing_last_modified)
    rescue InvalidLastModifiedDateError => e
      Rails.logger.error("Error checking if translations are outdated: #{e.message}")
      true
    end

    # Lottery bucket preference names *may* be missing
    #   human translations, and *may* need to be machine translated
    # This is a workaround to address that, ahead of a future project
    #   to better integrate human and machine translations
    def self.translations_are_missing_lottery_bucket_pref_names?(
      listing,
      listing_translations
    )
      listing['Lottery_Status'] == 'Lottery Complete' &&
        listing_translations.keys.none? { |key| key.match('listings.lotteryPreference.') }
    end

    def self.listing_is_outdated?(cache_last_modified, listing_last_modified)
      parse_time(cache_last_modified) > parse_time(listing_last_modified)
    rescue InvalidLastModifiedDateError => e
      Rails.logger.error("Error checking if listing is outdated: #{e.message}")
      true
    end

    def self.fetch_listing_translations_from_cache(listing_id)
      cache_key = listing_translations_cache_key(listing_id)
      Rails.logger.info(
        "ListingService Fetching translations from cache with key '#{cache_key}'",
      )
      @cache.fetch(listing_translations_cache_key(listing_id)) do
        Rails.logger.info(
          "ListingService Nothing in cache for key '#{cache_key}'",
        )
        {}
      end
    end

    def self.refresh_listing_cache(listing_id)
      endpoint = "#{CACHE_KEY_PREFIX}#{CGI.escape(listing_id)}"
      Request.new(parse_response: true).cached_get(endpoint, nil, true)
    end

    def self.parse_time(time_str)
      raise InvalidLastModifiedDateError, 'Time string cannot be nil' if time_str.nil?

      Time.parse(time_str)
    rescue ArgumentError => e
      Rails.logger.error("Error parsing time: #{e.message}")
      raise InvalidLastModifiedDateError, "Invalid time format: #{time_str}"
    end

    # get all units for a given listing
    def self.units(listing_id, opts = {})
      esc_listing_id = CGI.escape(listing_id)
      force = opts[:force] || false
      Request.new(parse_response: true)
             .cached_get("/Listing/Units/#{esc_listing_id}", nil, force)
    end

    # get all preferences for a given listing
    def self.preferences(listing_id, opts = {})
      esc_listing_id = CGI.escape(listing_id)
      force = opts[:force] || false
      Request.new(parse_response: true)
             .cached_get("/Listing/Preferences/#{esc_listing_id}", nil, force)
    end

    # get AMI: opts are percent, chartType, year
    def self.ami(opts = {})
      force = opts[:force] || false
      results = Request.new(parse_response: true).cached_get(
        "/ami?#{opts[:data].to_query}",
        nil,
        force,
      )
      results.sort_by { |i| i['numOfHousehold'] }
    end

    # get Lottery Buckets with rankings
    def self.lottery_buckets(listing_id, opts = {})
      esc_listing_id = CGI.escape(listing_id)
      force = opts[:force] || false
      data = Request.new
                    .cached_get("/Listing/LotteryResult/#{esc_listing_id}", nil, force)
      # cut down the bucketResults so it's not a huge JSON
      data['lotteryBuckets'] ||= []
      data['lotteryBuckets'].each do |bucket|
        bucket['preferenceResults'] = bucket['preferenceResults'].slice(0, 1)
      end
      data
    end

    # get Individual Lottery Result with rankings
    def self.lottery_ranking(listing_id, lottery_number)
      esc_listing_id = CGI.escape(listing_id)
      esc_lottery_number = CGI.escape(lottery_number)
      endpoint = "/Listing/LotteryResult/#{esc_listing_id}/#{esc_lottery_number}"
      Request.new.get(endpoint)
    end

    def self.listing_pricing_table(listing_id)
      esc_listing_id = CGI.escape(listing_id)
      endpoint = "/ListingPricingTable/#{esc_listing_id}"
      Request.new.get(endpoint)
    end

    def self.check_household_eligibility(listing_id, params)
      listing_id = CGI.escape(listing_id)
      endpoint = "/Listing/EligibilityCheck/#{listing_id}"
      %i[household_size incomelevel].each do |k|
        params[k] = params[k].to_i if params[k].present?
      end
      Request.new.get(endpoint, params)
    end

    def self.array_sort!(listing)
      listing.each do |k, v|
        listing[k] = v.sort_by { |i| i['Id'] } if v.is_a?(Array) && v[0] && v[0]['Id']
      end
    end

    def self.listing_translations_cache_key(listing_id)
      "#{CACHE_KEY_PREFIX}#{listing_id}/translations"
    end

    private_class_method def self.get_listings(params: {}, force_recache: false)
      params[:subset] ||= 'browse'
      Rails.logger.info("Calling self.get_listings with force: #{force_recache}")

      results = Request.new(parse_response: true)
                       .cached_get('/ListingDetails', params, force_recache)
      results_with_cached_listing_images = add_cloudfront_urls_for_listing_images(results)
      add_image_urls(results_with_cached_listing_images)
    end

    private_class_method def self.add_image_urls(listings)
      listing_images = ListingImage.all
      listings.each do |listing|
        listing_image = listing_images.select do |li|
          li.salesforce_listing_id == listing['Id']
        end.first
        # fallback to Building_URL for the case where ListingImages have not been set up
        url = listing_image ? listing_image.image_url : listing['Building_URL']
        listing['imageURL'] = url
      end
      listings
    end

    private_class_method def self.add_cloudfront_urls_for_listing_images(listings)
      listings.each do |listing|
        next unless listing['Listing_Images'].present?

        listing['Listing_Images'] = set_cloudfront_url(listing['Listing_Images'],
                                                       ListingImage.where(salesforce_listing_id: listing['Id']))
      end
      listings
    end

    private_class_method def self.set_cloudfront_url(sf_listing_images, cf_listing_images)
      sf_listing_images.each do |li|
        cf_listing_image = cf_listing_images.where(raw_image_url: li['Image_URL']).first
        url = cf_listing_image ? cf_listing_image.image_url : li['Image_URL']
        li['displayImageURL'] = url
      end
      sf_listing_images
    end
  end
end
