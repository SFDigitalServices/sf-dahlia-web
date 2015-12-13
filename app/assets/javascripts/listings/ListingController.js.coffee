############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ListingController = ($scope, $state, $sce, SharedService, ListingService) ->
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
    "#{listing.Property_Street_Address}, #{listing.Property_City} " +
    "#{listing.Property_State}, #{listing.Property_Zip_Code}"

  $scope.googleMapSrc = (listing) ->
    # exygy google places API key -- should be unlimited use for this API
    api_key = 'AIzaSyCW_oXspwGsSlthw-MrPxjNvdH56El1pjM'
    url = "https://www.google.com/maps/embed/v1/place?key=#{api_key}&q=#{$scope.formattedAddress(listing)}"
    $sce.trustAsResourceUrl(url)

  $scope.hasEligibilityFilters = ->
    ListingService.hasEligibilityFilters()

  $scope.listingApplicationClosed = (listing) ->
    today = new Date
    appDueDate = new Date(listing.Application_Due_Date)
    appDueDate < today

  $scope.lotteryDatePassed = (listing) ->
    today = new Date
    lotteryDate = new Date(listing.Lottery_Date)
    lotteryDate < today

  $scope.lotteryResultsAvailable = (listing) ->
    # to replace below with something like listing.Lottery_Results.length > 0
    false


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingController.$inject = ['$scope', '$state', '$sce', 'SharedService', 'ListingService']

angular
  .module('dahlia.controllers')
  .controller('ListingController', ListingController)
