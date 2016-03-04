############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = ($scope, $state, ListingService) ->
  # initialization
  $scope.listing = ListingService.listing
  $scope.sections = ['You', 'Household', 'Status', 'Income', 'Review']

  $scope.formattedAddress = (listing) ->
    ListingService.formattedAddress(listing)

  $scope.hasNav = ->
    $state.current.name != 'dahlia.short-form-application.intro'

  $scope.isActiveSection = (section) ->
    false

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ShortFormApplicationController.$inject = ['$scope', '$state', 'ListingService']

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
