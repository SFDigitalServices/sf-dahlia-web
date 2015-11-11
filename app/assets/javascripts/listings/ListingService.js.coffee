############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingService = ($http, $cookies) ->
  Service = {}
  Service.listing = {}
  Service.listings = []
  Service.favorites = []

  Service.getFavoriteListings = () ->
    Service.getListingsByIds(Service.favorites)

  Service.getFavorites = () ->
    favorites = $cookies.getObject('storedFavorites') || []
    angular.copy(favorites, Service.favorites)

  Service.toggleFavoriteListing = (listing_id) ->
    # toggle the value for listing_id
    index = Service.favorites.indexOf(listing_id)
    if index == -1
      # add the favorite
      Service.favorites.push(listing_id)
    else
      # remove the favorite
      Service.favorites.splice(index, 1)
    $cookies.putObject('storedFavorites', Service.favorites)

  Service.isFavorited = (listing_id) ->
    Service.favorites.indexOf(listing_id) > -1

  ###################################### Salesforce API Calls ###################################

  Service.getListing = (_id) ->
    angular.copy({}, Service.listing)
    $http.get("/json/listings/"+_id+".json").success((data, status, headers, config) ->
      angular.copy((if data and data.listing then data.listing else {}), Service.listing)
    ).error( (data, status, headers, config) ->
    )

  Service.getListings = () ->
    angular.copy({}, Service.listings)
    $http.get("/json/listings.json").success((data, status, headers, config) ->
      angular.copy((if data and data.listings then data.listings else {}), Service.listings)
    ).error( (data, status, headers, config) ->
    )

  # This is currently making a call to the same json data file as getListings
  # When wired to Salesforce, pass an array of Listing IDs that we would like returned.
  Service.getListingsByIds = (ids) ->
    angular.copy([], Service.listings)
    $http.get("/json/listings.json").success((data, status, headers, config) ->
      listings = if data and data.listings then data.listings else []
      # ---- this filter is only needed while we don't have a real API call
      listings = listings.filter (l) -> ids.indexOf(l.id) > -1
      # ---- ------ ------
      angular.copy(listings, Service.listings)
    ).error( (data, status, headers, config) ->
    )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingService.$inject = ['$http', '$cookies']

angular
  .module('dahlia.services')
  .service('ListingService', ListingService)
