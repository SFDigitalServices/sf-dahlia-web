############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ListingController = ($scope, $state, SharedService, ListingService) ->
  $scope.shared = SharedService
  $scope.listings = ListingService.listings
  $scope.listing = ListingService.listing
  $scope.favorites = ListingService.favorites
  $scope.activeOpionsClass = null
  $scope.activeIncomeClass = null
  $scope.activeStudioClass = null
  $scope.active1BedClass = null

  $scope.toggleFavoriteListing = (listing_id) ->
    ListingService.toggleFavoriteListing(listing_id)

  $scope.showApplicationOptions = false
  $scope.toggleApplicationOptions = () ->
    $scope.activeOpionsClass = if $scope.activeOpionsClass == 'active' then '' else 'active'
    $scope.showApplicationOptions = !$scope.showApplicationOptions

  $scope.showIncomeTable = false
  $scope.toggleIncomeTable = () ->
    $scope.activeIncomeClass = if $scope.activeIncomeClass == 'active' then '' else 'active'
    $scope.showIncomeTable = !$scope.showIncomeTable

  $scope.showStudioTable = false
  $scope.toggleStudioTable = () ->
    $scope.activeStudioClass = if $scope.activeStudioClass == 'active' then '' else 'active'
    $scope.showStudioTable = !$scope.showStudioTable

  $scope.show1BedTable = false
  $scope.toggle1BedTable = () ->
    $scope.active1BedClass = if $scope.active1BedClass == 'active' then '' else 'active'
    $scope.show1BedTable = !$scope.show1BedTable

  $scope.isFavorited = (listing_id) ->
    ListingService.isFavorited(listing_id)

  $scope.formattedAddress = (listing) ->
    "#{listing.address}, #{listing.city} #{listing.state}, #{listing.zipcode}"

  $scope.hasEligibilityFilters = ->
    ! angular.equals({}, ListingService.eligibility_filters)

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingController.$inject = ['$scope', '$state', 'SharedService', 'ListingService']

angular
  .module('dahlia.controllers')
  .controller('ListingController', ListingController)
