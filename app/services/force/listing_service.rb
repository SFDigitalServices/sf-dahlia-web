module Force
  # encapsulate all Salesforce Listing querying functions
  class ListingService < Force::Base
    WHITELIST_BROWSE_FIELDS = %i[
      Id
      listingID
      Name
      Application_Due_Date
      Accepting_Online_Applications
      Lottery_Date
      Lottery_Results
      Lottery_Results_Date
      Reserved_community_type
      Reserved_community_minimum_age
      reservedDescriptor
      prioritiesDescriptor
      hasWaitlist
      Units_Available
      unitSummaries
      Does_Match
      LastModifiedDate
      imageURL
    ].freeze

    # get all open listings or specific set of listings by id
    # `ids` is a comma-separated list of ids
    # `clean` determines whether to slim down the results
    def listings(ids = nil, clean = true)
      params = ids.present? ? { ids: ids } : nil
      results = get_listings(nil, params)
      return results unless clean
      clean_listings_for_browse(results)
    end

    # get listings with eligibility matches applied
    # filters:
    #  householdsize: n
    #  incomelevel: n
    #  childrenUnder6: n
    def eligible_listings(filters)
      results = get_listings(nil, filters)
      results = clean_listings_for_browse(results)
      # sort the matched listings to the top of the list
      results.partition { |i| i['Does_Match'] }.flatten
    end

    # get one detailed listing result by id
    def listing(id)
      get_listings(id).first
    end

    # get all units for a given listing
    def units(listing_id)
      listing_id = CGI.escape(listing_id)
      @parse_response = true
      cached_api_get("/Listing/Units/#{listing_id}", nil)
    end

    # get all preferences for a given listing
    def preferences(listing_id)
      listing_id = CGI.escape(listing_id)
      @parse_response = true
      cached_api_get("/Listing/Preferences/#{listing_id}", nil)
    end

    # get AMI: opts are percent, chartType, year
    def ami(opts = {})
      @parse_response = true
      results = cached_api_get("/ami?#{opts.to_query}", nil)
      results.sort_by { |i| i['numOfHousehold'] }
    end

    def ami_charts
      api_get('/ami/charts')
    end

    # get Lottery Buckets with rankings
    def lottery_buckets(listing_id)
      listing_id = CGI.escape(listing_id)
      @parse_response = false
      data = cached_api_get("/Listing/LotteryResult/#{listing_id}", nil)
      # cut down the bucketResults so it's not a huge JSON
      data['lotteryBuckets'] ||= []
      data['lotteryBuckets'].each do |bucket|
        bucket['preferenceResults'] = bucket['preferenceResults'].slice(0, 1)
      end
      data
    end

    # get Individual Lottery Result with rankings
    def lottery_ranking(listing_id, lottery_number)
      listing_id = CGI.escape(listing_id)
      endpoint = "/Listing/LotteryResult/#{listing_id}/#{lottery_number}"
      @parse_response = false
      cached_api_get(endpoint, nil)
    end

    def check_household_eligibility(listing_id, params)
      listing_id = CGI.escape(listing_id)
      endpoint = "/Listing/EligibilityCheck/#{listing_id}"
      %i[household_size incomelevel].each do |k|
        params[k] = params[k].to_i if params[k].present?
      end
      @parse_response = false
      api_get(endpoint, params)
    end

    def array_sort!(listing)
      listing.each do |k, v|
        listing[k] = v.sort_by { |i| i['Id'] } if v.is_a?(Array) && v[0] && v[0]['Id']
      end
    end

    private

    def get_listings(id = nil, params = nil)
      endpoint = '/ListingDetails'
      endpoint += "/#{CGI.escape(id)}" if id
      @parse_response = true
      results = cached_api_get(endpoint, params)
      add_image_urls(results)
    end

    def add_image_urls(listings)
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

    def clean_listings_for_browse(results)
      results.map do |listing|
        listing.select do |key|
          WHITELIST_BROWSE_FIELDS.include?(key.to_sym) || key.include?('Building')
        end
      end
    end
  end
end
