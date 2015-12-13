############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingService = ($http, $localStorage) ->
  Service = {}
  Service.listing = {}
  Service.listings = []

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

  ###################################### Salesforce API Calls ###################################

  Service.getListing = (_id) ->
    angular.copy({}, Service.listing)
    $http.get("/api/v1/listings/#{_id}.json").success((data, status, headers, config) ->
      angular.copy((if data and data.listing then data.listing else {}), Service.listing)
    ).error( (data, status, headers, config) ->
      # console.log data
    )

  Service.getListings = () ->
    angular.copy([], Service.listings)
    listings_endpoint = "/api/v1/listings.json"
    # check for default state
    if Service.hasEligibilityFilters()
      # note: eligibility matches returned by this endpoint are currently faked
      # and we are also not passing in any of the eligibility filters yet
      listings_endpoint = "/api/v1/listings-eligibility.json"
    $http.get(listings_endpoint).success((data, status, headers, config) ->
      angular.copy((if data and data.listings then data.listings else []), Service.listings)
    ).error( (data, status, headers, config) ->
      # console.log data
    )

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
