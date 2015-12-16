############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingService = ($http, $localStorage) ->
  Service = {}
  Service.listing = {}
  Service.listings = []
  Service.openListings = []
  Service.closedListings = []
  Service.lotteryResultsListings = []

  $localStorage.favorites ?= []
  Service.favorites = $localStorage.favorites

  Service.eligibility_filter_defaults =
    'household_size': ''
    'income_timeframe': ''
    'income_total': ''

  $localStorage.eligibility_filters ?= Service.eligibility_filter_defaults
  Service.eligibility_filters = $localStorage.eligibility_filters

  Service.getFavoriteListings = () ->
    Service.getListingsByIds(Service.favorites)

  Service.toggleFavoriteListing = (listing_id) ->
    # toggle the value for listing_id
    index = Service.favorites.indexOf(listing_id)
    if index == -1
      # add the favorite
      Service.favorites.push(listing_id)
    else
      # remove the favorite
      Service.favorites.splice(index, 1)

  Service.isFavorited = (listing_id) ->
    Service.favorites.indexOf(listing_id) > -1

  Service.setEligibilityFilters = (filters) ->
    angular.copy(filters, Service.eligibility_filters)

  Service.hasEligibilityFilters = ->
    ! angular.equals(Service.eligibility_filter_defaults, Service.eligibility_filters)

  Service.eligibilityYearlyIncome = ->
    if Service.eligibility_filters.income_timeframe == 'per_month'
      parseFloat(Service.eligibility_filters.income_total) * 12
    else
      Service.eligibility_filters.income_total

  ###################################### Salesforce API Calls ###################################

  Service.getListing = (_id) ->
    angular.copy({}, Service.listing)
    $http.get("/api/v1/listings/#{_id}.json").success((data, status, headers, config) ->
      angular.copy((if data and data.listing then data.listing else {}), Service.listing)
    ).error( (data, status, headers, config) ->
      # console.log data
    )

  Service.getListings = () ->
    angular.copy([], Service.openListings)
    angular.copy([], Service.closedListings)
    angular.copy([], Service.lotteryResultsListings)
    # check for default state
    if Service.hasEligibilityFilters()
      return Service.getListingsWithEligibility()
    $http.get("/api/v1/listings.json").success((data, status, headers, config) ->
      listings = if data and data.listings then data.listings else []
      Service.groupListings(listings)
    ).error( (data, status, headers, config) ->
      # console.log data
    )

  Service.getListingsWithEligibility = ->
    params =
      eligibility:
        householdsize: Service.eligibility_filters.household_size
        incomelevel: Service.eligibilityYearlyIncome()
        # TODO: vvv implement once child selection filter is added
        childrenUnder6: 0
    $http.post("/api/v1/listings-eligibility.json", params).success((data, status, headers, config) ->
      listings = (if data and data.listings then data.listings else [])
      Service.groupListings(listings)
    ).error( (data, status, headers, config) ->
      # console.log data
    )

  Service.groupListings = (listings) ->
    now = new Date()
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    listings.forEach (listing) ->
      due_date = new Date(listing.Application_Due_Date)
      if due_date > today
        Service.openListings.push(listing)
      else if due_date < today
        # TODO: check if this is the right field once we're getting it from Salesforce in
        # the /listings endpoint
        if listing.Lottery_Members
          Service.lotteryResultsListings.push(listing)
        else
          Service.closedListings.push(listing)


  # retrieves only the listings specified by the passed in array of ids
  Service.getListingsByIds = (ids) ->
    angular.copy([], Service.listings)
    params = {params: {ids: ids.join(',') }}
    $http.get("/api/v1/listings.json", params).success((data, status, headers, config) ->
      listings = if data and data.listings then data.listings else []
      angular.copy(listings, Service.listings)
    ).error( (data, status, headers, config) ->
      # console.log data
    )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingService.$inject = ['$http', '$localStorage']

angular
  .module('dahlia.services')
  .service('ListingService', ListingService)
