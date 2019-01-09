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

  #used in Favorites


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
