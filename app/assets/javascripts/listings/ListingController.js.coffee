############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ListingController = (
  $scope,
  $state,
  $sce,
  $sanitize,
  $filter,
  Carousel,
  SharedService,
  ListingService,
  IncomeCalculatorService,
  ShortFormApplicationService
) ->
  $scope.shared = SharedService
  $scope.listings = ListingService.listings
  $scope.openListings = ListingService.openListings
  $scope.openMatchListings = ListingService.openMatchListings
  $scope.openNotMatchListings = ListingService.openNotMatchListings
  $scope.closedListings = ListingService.closedListings
  $scope.lotteryResultsListings = ListingService.lotteryResultsListings
  $scope.listing = ListingService.listing
  $scope.lotteryBuckets = $scope.listing.Lottery_Buckets
  # TO DO: debug why this isn't working:
  # $scope.lotteryResultsRanking = $scope.listing.Lottery_Ranking
  $scope.favorites = ListingService.favorites
  $scope.activeOptionsClass = null
  $scope.maxIncomeLevels = ListingService.maxIncomeLevels
  $scope.lotteryPreferences = ListingService.lotteryPreferences
  $scope.eligibilityFilters = ListingService.eligibility_filters
  $scope.application = ShortFormApplicationService.application
  # for expanding the "read more/less" on What To Expect
  $scope.whatToExpectOpen = false
  # for expanding the "What happens next"
  $scope.whatHappens = false
  # for searching lottery number
  $scope.lotterySearchNumber = ''
  $scope.smallDisplayClass = "small-display-none"
  $scope.lotteryRankingSubmitted = false

  $scope.toggleFavoriteListing = (listing_id) ->
    ListingService.toggleFavoriteListing(listing_id)

  $scope.showApplicationOptions = false
  $scope.toggleApplicationOptions = () ->
    $scope.activeOptionsClass = if $scope.activeOptionsClass == 'active' then '' else 'active'
    $scope.showApplicationOptions = !$scope.showApplicationOptions

  $scope.toggleTable = (table) ->
    $scope["active#{table}Class"] = if $scope["active#{table}Class"] then '' else 'active'
    $scope.smallDisplayClass = if $scope.smallDisplayClass then '' else 'small-display-none'

  $scope.isActiveTable = (table) ->
    $scope["active#{table}Class"] == 'active'

  $scope.unitAreaRange = (unit_summary) ->
    if unit_summary.minSquareFt != unit_summary.maxSquareFt
      "#{unit_summary.minSquareFt} - #{unit_summary.maxSquareFt}"
    else
      unit_summary.minSquareFt

  $scope.unitsByType = (unit_type) ->
    $filter('groupBy')($scope.listing.Units, 'Unit_Type')[unit_type]

  $scope.isFavorited = (listing_id) ->
    ListingService.isFavorited(listing_id)

  $scope.formattedBuildingAddress = (listing, display) ->
    ListingService.formattedAddress(listing, 'Building', display)

  $scope.formattedApplicationAddress = (listing, display) ->
    ListingService.formattedAddress(listing, 'Application', display)

  $scope.googleMapSrc = (listing) ->
    # exygy google places API key -- should be unlimited use for this API
    api_key = 'AIzaSyCW_oXspwGsSlthw-MrPxjNvdH56El1pjM'
    url = "https://www.google.com/maps/embed/v1/place?key=#{api_key}&q=#{$scope.formattedBuildingAddress(listing)}"
    $sce.trustAsResourceUrl(url)

  $scope.hasEligibilityFilters = ->
    ListingService.hasEligibilityFilters()

  $scope.clearEligibilityFilters = ->
    ListingService.resetEligibilityFilters()
    IncomeCalculatorService.resetIncomeSources()

  $scope.listingApplicationClosed = (listing) ->
    ! ListingService.listingIsOpen(listing)

  $scope.lotteryDatePassed = (listing) ->
    today = new Date
    lotteryDate = new Date(listing.Lottery_Date)
    lotteryDate <= today

  $scope.openLotteryResultsModal = () ->
    ListingService.getLotteryBuckets().then( ->
      ListingService.openLotteryResultsModal()
    )

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

  # lottery search
  $scope.clearLotterySearchNumber = ->
    $scope.lotteryRankingSubmitted = false
    $scope.lotterySearchNumber = ''

  $scope.applicantSelectedForPreference = ->
    applicationResults = $scope.listing.Lottery_Ranking.applicationResults[0]
    return _.includes(applicationResults, true)

  $scope.applicantIsCop = ->
    $scope.listing.Lottery_Ranking.applicationResults[0].certOfPreference

  $scope.showNeighborhoodPreferences = ->
    ListingService.showNeighborhoodPreferences($scope.listing)

  $scope.lotteryNumberValid = ->
    !!$scope.listing.Lottery_Ranking.applicationResults[0]

  # Temp function to display ranking markup
  $scope.showLotteryRanking = ->
    if $scope.lotterySearchNumber == ''
      $scope.lotteryRankingSubmitted = false
    else
      ListingService.getLotteryRanking($scope.lotterySearchNumber).then( ->
        $scope.lotteryRankingSubmitted = true
      )

  $scope.submittedApplication = ->
    $scope.application && $scope.application.status == 'Submitted'

  $scope.hasDraftApplication = ->
    $scope.application && $scope.application.status == 'Draft'

  # TODO: -- REMOVE HARDCODED FEATURES --
  $scope.showLotteryPreferences = ->
    $scope.listingIs480Potrero() || $scope.listingIsAlchemy()

  $scope.listingIs480Potrero = ->
    ListingService.listingIs480Potrero($scope.listing)

  $scope.listingIsAlchemy = ->
    ListingService.listingIsAlchemy($scope.listing)

  if ($scope.listingIsAlchemy())
    $scope.listing.COPUnits = 50
    $scope.listing.DTHPUnits = 10
    $scope.listing.NRHPUnits = 20
    $scope.listing.supervisorialDistrict = 8
    $scope.listing.Lottery_Results = true
    $scope.listing.LotteryResultsPDFUrl  = '''
      http://sfmohcd.org/sites/default/files/Documents/MOH/Lottery%20Results/Posting%20200%20Buchanan%20-%20Alchemy%208-31-2016.pdf
    '''

  if ($scope.listingIs480Potrero())
    $scope.listing.COPUnits = 11
    $scope.listing.DTHPUnits = 2
    $scope.listing.NRHPUnits = 4
    $scope.listing.supervisorialDistrict = 10

  # ------------------------------




############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingController.$inject = [
  '$scope',
  '$state',
  '$sce',
  '$sanitize',
  '$filter',
  'Carousel',
  'SharedService',
  'ListingService',
  'IncomeCalculatorService',
  'ShortFormApplicationService'
]

angular
  .module('dahlia.controllers')
  .controller('ListingController', ListingController)
