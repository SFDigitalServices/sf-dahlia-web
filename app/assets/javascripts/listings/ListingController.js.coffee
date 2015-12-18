############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ListingController = ($scope, $state, $sce, SharedService, ListingService) ->
  $scope.shared = SharedService
  $scope.listings = ListingService.listings
  $scope.openListings = ListingService.openListings
  $scope.closedListings = ListingService.closedListings
  $scope.lotteryResultsListings = ListingService.lotteryResultsListings
  $scope.listing = ListingService.listing
  $scope.favorites = ListingService.favorites
  $scope.activeOptionsClass = null

  $scope.toggleFavoriteListing = (listing_id) ->
    ListingService.toggleFavoriteListing(listing_id)

  $scope.showApplicationOptions = false
  $scope.toggleApplicationOptions = () ->
    $scope.activeOptionsClass = if $scope.activeOptionsClass == 'active' then '' else 'active'
    $scope.showApplicationOptions = !$scope.showApplicationOptions

  # --- REFACTORED THE BELOW INTO toggleTable and isActiveTable
  # --- to remove before PR+merging this branch
  # $scope.showIncomeTable = false
  # $scope.toggleIncomeTable = () ->
  #   $scope.activeIncomeClass = if $scope.activeIncomeClass == 'active' then '' else 'active'
  #   $scope.showIncomeTable = !$scope.showIncomeTable

  # $scope.showStudioTable = false
  # $scope.toggleStudioTable = () ->
  #   $scope.activeStudioClass = if $scope.activeStudioClass == 'active' then '' else 'active'
  #   $scope.showStudioTable = !$scope.showStudioTable

  # $scope.show1BedTable = false
  # $scope.toggle1BedTable = () ->
  #   $scope.active1BedClass = if $scope.active1BedClass == 'active' then '' else 'active'
  #   $scope.show1BedTable = !$scope.show1BedTable

  $scope.toggleTable = (table) ->
    $scope["active#{table}Class"] = if $scope["active#{table}Class"] then '' else 'active'

  $scope.isActiveTable = (table) ->
    $scope["active#{table}Class"] == 'active'

  $scope.unitAreaRange = (units) ->
    # TODO: actually find min/max
    # if units.length == 1
    units[0].Unit_Square_Footage

  $scope.unitBMRMinMonthlyRange = (units) ->
    # TODO: actually find min/max
    # if units.length == 1
    units[0].BMR_Rental_Minimum_Monthly_Income_Needed

  $scope.unitBMRRentMonthlyRange = (units) ->
    # TODO: actually find min/max
    # if units.length == 1
    units[0].BMR_Rent_Monthly

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

  $scope.eligibilityHouseholdSize = ->
    ListingService.eligibilityHouseholdSize()

  $scope.eligibilityIncomeTimeframe = ->
    ListingService.eligibilityIncomeTimeframe()

  $scope.eligibilityIncomeTotal = ->
    ListingService.eligibilityIncomeTotal()

  $scope.listingApplicationClosed = (listing) ->
    today = new Date
    appDueDate = new Date(listing.Application_Due_Date)
    appDueDate < today

  $scope.lotteryDatePassed = (listing) ->
    today = new Date
    lotteryDate = new Date(listing.Lottery_Date)
    lotteryDate <= today

  $scope.lotteryResultsAvailable = (listing) ->
    # to replace below with something like listing.Lottery_Results.length > 0
    false

  $scope.lotteryDateVenueAvailable = (listing) ->
    (listing.Lottery_Date != undefined &&
      listing.Lottery_Venue != undefined && listing.Lottery_Street_Address != undefined)

  $scope.imageURL = (listing) ->
    # TODO: remove "or" case when we know we have real images
    # just a fallback for now
    listing.Property_URL || 'https://placehold.it/474x316'

  $scope.showMatches = ->
    $state.current.name == 'dahlia.listings' && $scope.hasEligibilityFilters()

  $scope.isOpenListing = (listing) ->
    $scope.openListings.indexOf(listing) > -1
  $scope.isClosedListing = (listing) ->
    $scope.closedListings.indexOf(listing) > -1
  $scope.isLotteryResultsListing = (listing) ->
    $scope.lotteryResultsListings.indexOf(listing) > -1

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingController.$inject = ['$scope', '$state', '$sce', 'SharedService', 'ListingService']

angular
  .module('dahlia.controllers')
  .controller('ListingController', ListingController)
