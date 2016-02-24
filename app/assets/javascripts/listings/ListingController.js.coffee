############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ListingController = ($scope, $state, $sce, $sanitize, Carousel, SharedService, ListingService) ->
  $scope.shared = SharedService
  $scope.listings = ListingService.listings
  $scope.openListings = ListingService.openListings
  $scope.openMatchListings = ListingService.openMatchListings
  $scope.openNotMatchListings = ListingService.openNotMatchListings
  $scope.closedListings = ListingService.closedListings
  $scope.lotteryResultsListings = ListingService.lotteryResultsListings
  $scope.listing = ListingService.listing
  $scope.favorites = ListingService.favorites
  $scope.activeOptionsClass = null
  $scope.maxIncomeLevels = ListingService.maxIncomeLevels
  # for expanding the "read more/less" on What To Expect
  $scope.whatToExpectOpen = false

  $scope.toggleFavoriteListing = (listing_id) ->
    ListingService.toggleFavoriteListing(listing_id)

  $scope.showApplicationOptions = false
  $scope.toggleApplicationOptions = () ->
    $scope.activeOptionsClass = if $scope.activeOptionsClass == 'active' then '' else 'active'
    $scope.showApplicationOptions = !$scope.showApplicationOptions

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
    # If Street address is undefined, then return false for display and google map lookup
    if listing.Building_Street_Address == undefined
      return
    # If other fields are undefined, proceed, with special string formatting
    if listing.Building_Street_Address != undefined
      Building_Street_Address = listing.Building_Street_Address + ', '
    else
      Building_Street_Address = ''
    if listing.Building_City != undefined
      Building_City = listing.Building_City
    else
      Building_City = ''
    if listing.Building_State != undefined
      Building_State = listing.Building_State + ', '
    else
      Building_State = ''
    if listing.Building_Zip_Code != undefined
      Building_Zip_Code = listing.Building_Zip_Code
    else
      Building_Zip_Code = ''
    "#{Building_Street_Address}#{Building_City} " +
    "#{Building_State}#{Building_Zip_Code}"

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

  $scope.eligibilityChildrenUnder6 = ->
    ListingService.eligibilityChildrenUnder6()

  $scope.listingApplicationClosed = (listing) ->
    today = new Date
    appDueDate = new Date(listing.Application_Due_Date)
    appDueDate < today

  $scope.lotteryDatePassed = (listing) ->
    today = new Date
    lotteryDate = new Date(listing.Lottery_Date)
    lotteryDate <= today

  $scope.lotteryResultsAvailable = (listing) ->
    listing.Lottery_Members && listing.Lottery_Members.length > 0

  $scope.openLotteryResultsModal = () ->
    ListingService.openLotteryResultsModal()

  $scope.lotteryDateVenueAvailable = (listing) ->
    (listing.Lottery_Date != undefined &&
      listing.Lottery_Venue != undefined && listing.Lottery_Street_Address != undefined)

  $scope.imageURL = (listing) ->
    # TODO: remove "or" case when we know we have real images
    # just a fallback for now
    listing.Building_URL || 'https://placehold.it/474x316'

  $scope.showMatches = ->
    $state.current.name == 'dahlia.listings' && $scope.hasEligibilityFilters()

  $scope.isOpenListing = (listing) ->
    $scope.openListings.indexOf(listing) > -1
  $scope.isOpenMatchListing = (listing) ->
    $scope.openMatchListings.indexOf(listing) > -1
  $scope.isOpenNotMatchListing = (listing) ->
    $scope.openNotMatchListings.indexOf(listing) > -1
  $scope.isClosedListing = (listing) ->
    $scope.closedListings.indexOf(listing) > -1
  $scope.isLotteryResultsListing = (listing) ->
    $scope.lotteryResultsListings.indexOf(listing) > -1

  # --- Carousel ---
  $scope.carouselHeight = 300
  $scope.Carousel = Carousel
  $scope.adjustCarouselHeight = (elem) ->
    $scope.$apply ->
      $scope.carouselHeight = elem[0].offsetHeight

  $scope.listingImages = (listing) ->
    # TODO: update when we are getting multiple images from Salesforce
    # right now it's just an array of one
    [$scope.imageURL(listing)]


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingController.$inject = ['$scope', '$state', '$sce', '$sanitize', 'Carousel', 'SharedService', 'ListingService']

angular
  .module('dahlia.controllers')
  .controller('ListingController', ListingController)
