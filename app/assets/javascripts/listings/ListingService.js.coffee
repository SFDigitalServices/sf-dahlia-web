############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingService = ($http, $localStorage) ->
  Service = {}
  Service.listing = {}
  Service.listings = []
  Service.openListings = []
  Service.openMatchListings = []
  Service.openNotMatchListings = []
  Service.closedListings = []
  Service.lotteryResultsListings = []

  $localStorage.favorites ?= []
  Service.favorites = $localStorage.favorites

  Service.eligibility_filter_defaults =
    'household_size': ''
    'income_timeframe': ''
    'income_total': ''
    'include_children_under_6': false
    'children_under_6': ''

  $localStorage.eligibility_filters ?= angular.copy(Service.eligibility_filter_defaults)
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
      parseFloat(Service.eligibility_filters.income_total)

  Service.eligibilityIncomeTimeframe = ->
    # just return 'month' or 'year' and get rid of the 'per_'
    if Service.eligibility_filters.income_timeframe
      Service.eligibility_filters.income_timeframe.split('per_')[1]
    else
      ''

  Service.eligibilityIncomeTotal = ->
    parseFloat(Service.eligibility_filters.income_total)


  Service.eligibilityHouseholdSize = ->
    Service.eligibility_filters.household_size

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
    angular.copy([], Service.openMatchListings)
    angular.copy([], Service.openNotMatchListings)
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
        includeChildrenUnder6: Service.eligibility_filters.include_children_under_6
        childrenUnder6: Service.eligibility_filters.children_under_6
    $http.post("/api/v1/listings-eligibility.json", params).success((data, status, headers, config) ->
      listings = (if data and data.listings then data.listings else [])
      Service.groupListings(listings)
    ).error( (data, status, headers, config) ->
      # console.log data
    )

  Service.groupListings = (listings) ->
    listings.forEach (listing) ->
      if Service.listingIsOpen(listing.Application_Due_Date)
        # All Open Listings Array
        Service.openListings.push(listing)
        if listing.Does_Match
          Service.openMatchListings.push(listing)
        else
          Service.openNotMatchListings.push(listing)
      else if !Service.listingIsOpen(listing.Application_Due_Date)
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

  # Business logic for determining if a listing is open
  Service.listingIsOpen = (due_date) ->
    now = new Date()
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    due_date = new Date(due_date)
    if due_date > today
      true
    else
      false

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingService.$inject = ['$http', '$localStorage']

angular
  .module('dahlia.services')
  .service('ListingService', ListingService)
