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
  $scope.loadingLotteryResults = false

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
    $scope.loadingLotteryResults = true
    ListingService.getLotteryBuckets().then( ->
      $scope.loadingLotteryResults = false
      $scope.lotteryBuckets = $scope.listing.Lottery_Buckets
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

  $scope.applicantHasCertOfPreference = ->
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
      $scope.loadingLotteryResults = true
      ListingService.getLotteryRanking($scope.lotterySearchNumber).then( ->
        $scope.lotteryRankingSubmitted = true
        $scope.loadingLotteryResults = false
      )

  $scope.submittedApplication = ->
    $scope.application && $scope.application.status == 'Submitted'

  $scope.hasDraftApplication = ->
    $scope.application && $scope.application.status == 'Draft'

  $scope.sortedOpenHouses = ->
    ListingService.sortByDate($scope.listing.Open_Houses)

  $scope.sortedInformationSessions = ->
    ListingService.sortByDate($scope.listing.Information_Sessions)

  # TODO: -- REMOVE HARDCODED FEATURES --
  $scope.showLotteryPreferences = ->
    $scope.listingIsAny([
      '480 Potrero'
      'Alchemy'
      '21 Clarence'
      '168 Hyde'
      'Olume'
      '3445 Geary'
      '125 Mason'
      'Argenta 909'
    ])

  $scope.showDownloadLotteryResultsButton = ->
    return false unless $scope.listing.LotteryResultsURL
    $scope.listingIsAny([
      'Rincon'
      '77 Bluxome'
      'Potrero 1010'
      '529 Stevenson'
      '888 Paris'
      '168 Hyde'
    ])

  $scope.listingIs = (name) ->
    ListingService.listingIs($scope.listing, name)

  $scope.listingIsAny = (names) ->
    ListingService.listingIsAny($scope.listing, names)

  $scope.positionOfPreference = (pref) ->
    prefs = []
    prefs.push('COP') if $scope.listing.COPUnits
    prefs.push('DTHP') if $scope.listing.DTHPUnits
    prefs.push('NRHP') if $scope.listing.NRHPUnits
    if pref != 'liveWork'
      pos = prefs.indexOf(pref) + 1
    else
      pos = prefs.length + 1
    return pos

  $scope.getOrdinal = (n) ->
    s = ['th', 'st', 'nd', 'rd']
    v = n % 100
    (s[(v - 20) % 10] or s[v] or s[0])

  if ($scope.listingIs('Alchemy'))
    $scope.listing.COPUnits = 50
    $scope.listing.DTHPUnits = 10
    $scope.listing.NRHPUnits = 20
    $scope.listing.supervisorialDistrict = 8

  if ($scope.listingIs('480 Potrero'))
    $scope.listing.COPUnits = 11
    $scope.listing.DTHPUnits = 2
    $scope.listing.NRHPUnits = 4
    $scope.listing.supervisorialDistrict = 10

  if ($scope.listingIs('21 Clarence'))
    $scope.listing.COPUnits = 1
    $scope.listing.DTHPUnits = 1
    $scope.listing.NRHPUnits = 0

  if ($scope.listingIs('168 Hyde'))
    $scope.listing.COPUnits = 1
    $scope.listing.DTHPUnits = 0
    $scope.listing.NRHPUnits = 0

  if ($scope.listingIs('Olume'))
    $scope.listing.COPUnits = 18
    $scope.listing.DTHPUnits = 3
    $scope.listing.NRHPUnits = 7
    $scope.listing.supervisorialDistrict = 6

  if ($scope.listingIs('3445 Geary'))
    $scope.listing.COPUnits = 1
    $scope.listing.DTHPUnits = 0
    $scope.listing.NRHPUnits = 0

  if ($scope.listingIs('125 Mason'))
    $scope.listing.COPUnits = 3
    $scope.listing.DTHPUnits = 3
    $scope.listing.NRHPUnits = 0

  if ($scope.listingIs('Argenta 909'))
    $scope.listing.COPUnits = 1
    $scope.listing.DTHPUnits = 1
    $scope.listing.NRHPUnits = 0
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
