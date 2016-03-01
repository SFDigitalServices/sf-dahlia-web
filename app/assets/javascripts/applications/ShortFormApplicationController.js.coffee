############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = ($scope, ListingService) ->
  # initialization
  $scope.listing = ListingService.listing
  console.log($scope.listing)

  $scope.formattedAddress = (listing) ->
    ListingService.formattedAddress(listing)

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ShortFormApplicationController.$inject = ['$scope', 'ListingService']

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
