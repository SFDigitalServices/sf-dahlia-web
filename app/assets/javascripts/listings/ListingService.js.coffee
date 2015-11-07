############################################################################################
####################################### SERVICE ############################################
############################################################################################


ListingService = ($http, $modal, $cookies) ->
  Service = {}
  Service.listing = {}
  Service.listings = []
  Service.favorites = {}

  Service.getFavoriteListings = () ->
    console.log('getFavoriteListings called')
    # 1. Read the favorite listings array from favorites cookie
    # Service.favorites = ...
    # 2. Pass the array Salesforce api call to return favorites.
    # Service.getListingsByIds(favorites)

  Service.getListing = (_id) ->
    angular.copy({}, Service.listing)
    $http.get("/json/listings/"+_id+".json").success((data, status, headers, config) ->
      angular.copy((if data and data.listing then data.listing else {}), Service.listing)
    ).error( (data, status, headers, config) ->
      # console.log data
    )

  Service.getListingsByIds = (_ids) ->
    angular.copy({}, Service.listings)
    # Currently this pulls the same dataset that Listings uses, we want to make a 
    # new API Call to Salesforce for our listings by IDs.
    $http.get(asset_path("listings.json")).success((data, status, headers, config) ->
      angular.copy((if data and data.listings then data.listings else {}), Service.listings)
      # console.log(Service.listings)
    ).error( (data, status, headers, config) ->
      # console.log data
    )

  Service.getFavorites = () ->
    favorites = $cookies.getObject('Service.favorites') || {}
    angular.copy(favorites, Service.favorites)

  Service.toggleFavoriteListing = (listing_id) ->
    # toggle the value for listing_id
    Service.favorites[listing_id] = !Service.favorites[listing_id]
    $cookies.putObject('Service.favorites', Service.favorites)

  Service.getListings = () ->
    angular.copy({}, Service.listings)
    $http.get(asset_path("listings.json")).success((data, status, headers, config) ->
      angular.copy((if data and data.listings then data.listings else {}), Service.listings)
    ).error( (data, status, headers, config) ->
      console.log data
    )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingService.$inject = ['$http', '$modal', '$cookies']

angular
  .module('dahlia.services')
  .service('ListingService', ListingService)

