module SalesforceService
  # encapsulate all Salesforce Listing querying functions
  class ListingService < SalesforceService::Base
    # get all open listings or specific set of listings by id
    # `ids` is a comma-separated list of ids
    def self.listings(ids = nil)
      params = ids.present? ? { ids: ids } : nil
      cached_api_get('/ListingDetails', params, true)
    end

    # get listings with eligibility matches applied
    # filters:
    #  householdsize: n
    #  incomelevel: n
    #  childrenUnder6: n
    def self.eligible_listings(filters)
      results = api_get('/ListingDetails', filters, true)
      # sort the matched listings to the top of the list
      # TODO: replace with sorting on the JS side
      results.partition { |i| i['Does_Match'] }.flatten
    end

    # get one detailed listing result by id
    def self.listing(id)
      cached_api_get("/ListingDetails/#{id}", nil, true).first
    end

    # get all units for a given listing
    def self.units(listing_id)
      cached_api_get("/Listing/Units/#{listing_id}", nil, true)
    end

    # get AMI
    def self.ami(percent = 100)
      results = cached_api_get("/ami?percent=#{percent}", nil, true)
      results.sort_by { |i| i['numOfHousehold'] }
    end

    # get Lottery Buckets with rankings
    def self.lottery_buckets(listing_id)
      api_get("/Listing/LotteryResult/Bucket/#{listing_id}", nil, false)
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
  end
end
