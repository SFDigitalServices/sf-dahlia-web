# frozen_string_literal: true

module Force
  # encapsulate all Salesforce Listing querying functions
  class ListingService
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
      endpoint = "/ListingDetails/#{CGI.escape(id)}"
      force = opts[:force] || false
      Rails.logger.info("Calling self.listing for #{id} with force: #{force}")
      results = Request.new(parse_response: true).cached_get(endpoint, nil, force)
      results_with_cached_listing_images = add_cloudfront_urls_for_listing_images(results)
      add_image_urls(results_with_cached_listing_images).first
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

    def self.cache_ami_chart_data(units)
      max_ami_types = get_max_ami_chart_data_from_units(units)
      min_ami_types = get_min_ami_chart_data_from_units(units)
      max_ami_types&.each do |max_ami_type|
        ami({ data: max_ami_type, force: true })
      end
      min_ami_types&.each do |min_ami_type|
        ami({ data: min_ami_type, force: true })
      end
    end

    def self.max_ami_match(unique_chart, unit)
      unique_chart['year'] == unit['AMI_chart_year'] and
        unique_chart['type'] == unit['AMI_chart_type'] and
        unique_chart['percent'] == unit['Max_AMI_for_Qualifying_Unit']
    end

    def self.get_max_ami_chart_data_from_units(units)
      unique_charts = []

      units.each do |unit|
        unique_chart_match_for_max = nil
        unique_charts.each do |unique_chart|
          next unless max_ami_match(unique_chart, unit)

          unique_chart_match_for_max = unique_chart

          break
        end

        next unless !unique_chart_match_for_max && unit['Max_AMI_for_Qualifying_Unit']

        unique_charts << {
          'year' => unit['AMI_chart_year'],
          'type' => unit['AMI_chart_type'],
          'percent' => unit['Max_AMI_for_Qualifying_Unit'],
          'derivedFrom' => 'MaxAmi',
        }
      end
      unique_charts
    end

    def self.min_ami_match(unique_chart, unit)
      unique_chart['year'] == unit['AMI_chart_year'] and
        unique_chart['type'] == unit['AMI_chart_type'] and
        unique_chart['percent'] == unit['Min_AMI_for_Qualifying_Unit']
    end

    def self.get_min_ami_chart_data_from_units(units)
      unique_charts = []

      units.each do |unit|
        unique_chart_match_for_min = nil
        unique_charts.each do |unique_chart|
          next unless min_ami_match(unique_chart, unit)

          unique_chart_match_for_min = unique_chart
          break
        end

        next unless !unique_chart_match_for_min && unit['Min_AMI_for_Qualifying_Unit']

        unique_charts << {
          'year' => unit['AMI_chart_year'],
          'type' => unit['AMI_chart_type'],
          'percent' => unit['Min_AMI_for_Qualifying_Unit'],
          'derivedFrom' => 'MinAmi',
        }
      end
      unique_charts
    end

    # get Lottery Buckets with rankings
    def self.lottery_buckets(listing_id, opts = {})
      # Temporary workaround for `lottery_buckets` API issues, revert once fixed
      return nil if listing_id == 'a0W4U00000IXRHWUA5'

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
