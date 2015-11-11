############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ListingController = ($scope, $state, ListingService) ->
  $scope.listings = ListingService.listings
  $scope.listing = ListingService.listing
  $scope.favorites = ListingService.favorites

  $scope.toggleFavoriteListing = (listing_id) ->
    ListingService.toggleFavoriteListing(listing_id)

  $scope.isFavorited = (listing_id) ->
    ListingService.isFavorited(listing_id)

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingController.$inject = ['$scope', '$state', 'ListingService']

angular
  .module('dahlia.controllers')
  .controller('ListingController', ListingController)
