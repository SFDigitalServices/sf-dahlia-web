############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ListingController = (
  $scope,
  $state,
  $sce,
  $sanitize,
  $timeout,
  $filter,
  $translate,
  $location,
  Carousel,
  SharedService,
  ListingService,
  IncomeCalculatorService,
  ShortFormApplicationService,
  AnalyticsService
) ->
  $scope.listing = ListingService.listing

  #used in Favorites
  $scope.isFavorited = (listing_id) ->
    ListingService.isFavorited(listing_id)



############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingController.$inject = [
  '$scope',
  '$state',
  '$sce',
  '$sanitize',
  '$timeout',
  '$filter',
  '$translate',
  '$location',
  'Carousel',
  'SharedService',
  'ListingService',
  'IncomeCalculatorService',
  'ShortFormApplicationService',
  'AnalyticsService'
]

angular
  .module('dahlia.controllers')
  .controller('ListingController', ListingController)
