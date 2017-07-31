module SalesforceService
  # encapsulate all Salesforce Listing querying functions
  class ListingService < SalesforceService::Base
    WHITELIST_BROWSE_FIELDS = %i(
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
    ).freeze

    # get all open listings or specific set of listings by id
    # `ids` is a comma-separated list of ids
    # `clean` determines whether to slim down the results
    def self.listings(ids = nil, clean = true)
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
    def self.eligible_listings(filters)
      results = get_listings(nil, filters)
      results = clean_listings_for_browse(results)
      # sort the matched listings to the top of the list
      results.partition { |i| i['Does_Match'] }.flatten
    end

    # get one detailed listing result by id
    def self.listing(id)
      get_listings(id).first
    end

    # get all units for a given listing
    def self.units(listing_id)
      cached_api_get("/Listing/Units/#{listing_id}", nil, true)
    end

    # get all preferences for a given listing
    def self.preferences(listing_id)
      cached_api_get("/Listing/Preferences/#{listing_id}", nil, true)
    end

    # get AMI: opts are percent, chartType, year
    def self.ami(opts = {})
      results = cached_api_get("/ami?#{opts.to_query}", nil, true)
      results.sort_by { |i| i['numOfHousehold'] }
    end

    def self.ami_charts
      api_get('/ami/charts')
    end

    # get Lottery Buckets with rankings
    def self.lottery_buckets(listing_id)
      data = cached_api_get("/Listing/LotteryResult/Bucket/#{listing_id}", nil, false)
      # cut down the bucketResults so it's not a huge JSON
      data['bucketResults'].each do |bucket|
        bucket['bucketResults'] = bucket['bucketResults'].slice(0, 1)
      end
      data
    end

    # get Individual Lottery Result with rankings
    def self.lottery_ranking(listing_id, lottery_number)
      endpoint = "/Listing/LotteryResult/#{listing_id}/#{lottery_number}"
      api_get(endpoint, nil, false)
    end

    def self.check_household_eligibility(listing_id, params)
      endpoint = "/Listing/EligibilityCheck/#{listing_id}"
      %i(household_size incomelevel).each do |k|
        params[k] = params[k].to_i if params[k].present?
      end
      api_get(endpoint, params, false)
    end

    def self.get_listings(id = nil, params = nil)
      endpoint = '/ListingDetails'
      endpoint += "/#{id}" if id
      results = cached_api_get(endpoint, params, true)
      add_image_urls(results)
    end

    def self.add_image_urls(listings)
      listing_images = ListingImage.all
      listings.each do |listing|
        listing_image = listing_images.select do |li|
          li.salesforce_listing_id == listing['Id']
        end.first
        listing['imageURL'] = listing_image ? listing_image.image_url : nil
      end
      listings
    end

    def self.clean_listings_for_browse(results)
      results.map do |listing|
        listing.select do |key|
          WHITELIST_BROWSE_FIELDS.include?(key.to_sym) || key.include?('Building')
        end
      end
    end

    def self.array_sort!(listing)
      listing.each do |k, v|
        if v.is_a?(Array) && v[0] && v[0]['Id']
          listing[k] = v.sort_by { |i| i['Id'] }
        end
      end
    end
  end
end
