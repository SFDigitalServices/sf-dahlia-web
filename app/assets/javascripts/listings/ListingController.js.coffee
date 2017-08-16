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
  Carousel,
  SharedService,
  ListingService,
  IncomeCalculatorService,
  ShortFormApplicationService,
  AnalyticsService
) ->
  $scope.shared = SharedService
  $scope.listings = ListingService.listings
  $scope.openListings = ListingService.openListings
  $scope.openMatchListings = ListingService.openMatchListings
  $scope.openNotMatchListings = ListingService.openNotMatchListings
  $scope.closedListings = ListingService.closedListings
  $scope.lotteryResultsListings = ListingService.lotteryResultsListings
  $scope.listing = ListingService.listing
  $scope.lotteryBucketInfo = ListingService.lotteryBucketInfo
  $scope.lotteryRankingInfo = ListingService.lotteryRankingInfo
  $scope.favorites = ListingService.favorites
  $scope.AMICharts = ListingService.AMICharts
  $scope.lotteryPreferences = ListingService.lotteryPreferences
  $scope.eligibilityFilters = ListingService.eligibility_filters
  $scope.application = ShortFormApplicationService.application
  # for expanding the "read more/less" on What To Expect
  $scope.whatToExpectOpen = false
  $scope.amiChartExpanded = false
  # for expanding the "What happens next"
  $scope.whatHappens = false
  # for searching lottery number
  $scope.lotterySearchNumber = ''
  $scope.lotteryRankingSubmitted = false
  $scope.loading = ListingService.loading
  $scope.listingDownloadURLs = ListingService.listingDownloadURLs

  $scope.reservedUnitIcons = [
    $sce.trustAsResourceUrl('#i-star')
    $sce.trustAsResourceUrl('#i-cross')
    $sce.trustAsResourceUrl('#i-oval')
    $sce.trustAsResourceUrl('#i-polygon')
  ]

  $scope.toggleFavoriteListing = (listing_id) ->
    ListingService.toggleFavoriteListing(listing_id)

  $scope.showApplicationOptions = false
  $scope.toggleApplicationOptions = () ->
    $scope.showApplicationOptions = !$scope.showApplicationOptions

  $scope.toggleTable = (table) ->
    $scope["active#{table}Class"] = if $scope["active#{table}Class"] then '' else 'active'

  $scope.isActiveTable = (table) ->
    $scope["active#{table}Class"] == 'active'

  $scope.isFavorited = (listing_id) ->
    ListingService.isFavorited(listing_id)

  $scope.formattedBuildingAddress = (listing, display) ->
    ListingService.formattedAddress(listing, 'Building', display)

  $scope.formattedApplicationAddress = (listing, display) ->
    ListingService.formattedAddress(listing, 'Application', display)

  $scope.formattedLeasingAgentAddress = (listing, display) ->
    ListingService.formattedAddress(listing, 'Leasing_Agent', display)

  $scope.leasingAgentInfoAvailable = ->
    l = $scope.listing
    l.Leasing_Agent_Phone || l.Leasing_Agent_Email || l.Leasing_Agent_Street

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

  $scope.openLotteryResultsModal = () ->
    ListingService.openLotteryResultsModal()

  $scope.lotteryDateVenueAvailable = (listing) ->
    (listing.Lottery_Date != undefined &&
      listing.Lottery_Venue != undefined && listing.Lottery_Street_Address != undefined)

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

  $scope.waitlistSlotsRemaining = (listing) ->
    listing.Maximum_waitlist_size - listing.Number_of_people_currently_on_waitlist

  # --- Carousel ---
  $scope.carouselHeight = 300
  $scope.Carousel = Carousel
  $scope.adjustCarouselHeight = (elem) ->
    # for why we need $timeout, see:
    # http://stackoverflow.com/a/18996042/260495
    $timeout ->
      $scope.carouselHeight = elem[0].offsetHeight

  $scope.listingImages = (listing) ->
    # TODO: update when we are getting multiple images from Salesforce
    # right now it's just an array of one
    [listing.imageURL]

  # lottery search
  $scope.clearLotterySearchNumber = ->
    $scope.lotteryRankingSubmitted = false
    $scope.lotterySearchNumber = ''

  $scope.preferenceBucketResults = (prefName) ->
    preferenceBucketResults = _.find($scope.lotteryRankingInfo.lotteryBuckets, { 'preferenceName': prefName })
    if preferenceBucketResults then preferenceBucketResults.preferenceResults else []

  $scope.applicantSelectedForPreference = ->
    preferenceBucketResults = _.filter($scope.lotteryRankingInfo.lotteryBuckets, (bucket) ->
      return false unless bucket.preferenceResults[0]
      bucket.preferenceName != 'generalLottery' && bucket.preferenceResults[0].preferenceRank != null
    )
    preferenceBucketResults.length > 0

  $scope.applicantHasCertOfPreference = ->
    results = $scope.preferenceBucketResults('Certificate of Preference (COP)')[0]
    results && results.preferenceRank

  $scope.lotteryNumberValid = ->
    return unless $scope.lotteryRankingInfo && $scope.lotteryRankingInfo.lotteryBuckets
    # true if there are any lotteryBuckets
    _.some($scope.lotteryRankingInfo.lotteryBuckets, (bucket) -> !_.isEmpty(bucket.preferenceResults))

  # Temp function to display ranking markup
  $scope.showLotteryRanking = ->
    if $scope.lotterySearchNumber == ''
      $scope.lotteryRankingSubmitted = false
    else
      $scope.loading.lotteryRank = true
      $scope.lotterySearchNumber = ListingService.formatLotteryNumber($scope.lotterySearchNumber)
      ListingService.getLotteryRanking($scope.lotterySearchNumber).then( ->
        AnalyticsService.trackInvalidLotteryNumber() if !$scope.lotteryNumberValid()
        $scope.lotteryRankingSubmitted = true
        $scope.loading.lotteryRank = false
      )

  $scope.submittedApplication = ->
    $scope.application &&
    $scope.application.id &&
    $scope.application.status.toLowerCase() == 'submitted'

  $scope.hasDraftApplication = ->
    $scope.application &&
    $scope.application.id &&
    $scope.application.status.toLowerCase() == 'draft'

  $scope.sortedOpenHouses = ->
    ListingService.sortByDate($scope.listing.Open_Houses)

  $scope.sortedInformationSessions = ->
    ListingService.sortByDate($scope.listing.Information_Sessions)

  $scope.showLotteryResultsModalButton = ->
    ListingService.listingHasLotteryBuckets()

  $scope.showDownloadLotteryResultsButton = ->
    $scope.listing.LotteryResultsURL && !ListingService.listingHasLotteryBuckets()

  $scope.listingHasLotteryResults = ->
    ListingService.listingHasLotteryResults()

  $scope.listingHasPreferences = ->
    $scope.listing.preferences && $scope.listing.preferences.length

  $scope.listingHasPreference = (preference) ->
    ListingService.hasPreference(preference)

  $scope.closedAndLotteryListingsCount = ->
    $scope.lotteryResultsListings.length + $scope.closedListings.length

  $scope.hasMultipleAMICharts = ->
    $scope.AMICharts.length > 1

  $scope.hasMultipleAMIUnits = ->
    _.keys($scope.listing.groupedUnits).length > 1

  $scope.occupancy = (unitSummary) ->
    return '1' if unitSummary.maxOccupancy == 1
    unitSummary.minOccupancy + '-' + unitSummary.maxOccupancy

  $scope.occupancyLabel = (maxOccupancy) ->
    return $translate.instant('LISTINGS.PERSON') if maxOccupancy == 1
    $translate.instant('LISTINGS.PEOPLE')

  $scope.formatBaths = (numberOfBathrooms) ->
    return 'Shared' if numberOfBathrooms == 0
    return '1/2 ' + $translate.instant('LISTINGS.BATH') if numberOfBathrooms == 0.5

    fullBaths = Math.floor numberOfBathrooms
    andAHalf = numberOfBathrooms - fullBaths == 0.5

    if andAHalf
      fullBaths + ' 1/2 ' + $translate.instant('LISTINGS.BATH')
    else
      numberOfBathrooms

  $scope.occupancyIncomeLevels = (amiLevel) ->
    ListingService.occupancyIncomeLevels($scope.listing, amiLevel)

  $scope.householdAMIChartCutoff = ->
    ListingService.householdAMIChartCutoff()

  $scope.minYearlyIncome = ->
    ListingService.minYearlyIncome()

  $scope.incomeForHouseholdSize = (amiChart, householdIncomeLevel) ->
    ListingService.incomeForHouseholdSize(amiChart, householdIncomeLevel)

  $scope.listingHasPriorityUnits = ->
    ListingService.listingHasPriorityUnits($scope.listing)

  $scope.listingHasReservedUnits = ->
    ListingService.listingHasReservedUnits($scope.listing)

  $scope.listingHasSROUnits = ->
    ListingService.listingHasSROUnits($scope.listing)

  $scope.listingHasOnlySROUnits = ->
    ListingService.listingHasOnlySROUnits($scope.listing)

  $scope.listingIsReservedCommunity = (listing = $scope.listing) ->
    ListingService.listingIsReservedCommunity(listing)

  $scope.allListingUnitsAvailable = ->
    ListingService.allListingUnitsAvailable($scope.listing)

  $scope.reservedDescriptorIcon = (listing, descriptor) ->
    index = _.findIndex(listing.reservedDescriptor, ['name', descriptor])
    $scope.reservedUnitIcons[index]

  $scope.reservedForLabels = (listing) ->
    types = []
    _.each listing.reservedDescriptor, (descriptor) ->
      if descriptor.name
        type = descriptor.name
        types.push($scope.reservedLabel(listing, type, 'reservedForWhoAre'))
    if types.length then types.join(' or ') else ''

  $scope.reservedLabel = (listing, type,  modifier) ->
    labelMap =
      "#{ListingService.RESERVED_TYPES.SENIOR}":
        building: 'Senior'
        eligibility: 'Seniors'
        reservedFor: "seniors #{$scope.seniorMinimumAge(listing)}"
        reservedForWhoAre: "seniors #{$scope.seniorMinimumAge(listing)}"
        unitDescription: "seniors #{$scope.seniorMinimumAge(listing)}"
      "#{ListingService.RESERVED_TYPES.VETERAN}":
        building: 'Veterans'
        eligibility: 'Veterans'
        reservedFor: 'veterans'
        reservedForWhoAre: 'veterans'
        unitDescription: 'veterans of the U.S. Armed Forces'
      "#{ListingService.RESERVED_TYPES.DISABLED}":
        building: 'Developmental Disability'
        eligibility: 'People with developmental disabilities'
        reservedFor: 'people with developmental disabilities'
        reservedForWhoAre: 'developmentally disabled'
        unitDescription: 'people with developmental disabilities'

    return type unless labelMap[type]
    return labelMap[type][modifier]

  $scope.priorityLabel = (priority, modifier) ->
    labelMap =
      'Vision impaired':
        name: 'Vision Impairments'
        description: 'impaired vision'
      'Hearing impaired':
        name: 'Hearing Impairments'
        description: 'impaired hearing'
      'Hearing/Vision impaired':
        name: 'Vision and/or Hearing Impairments'
        description: 'impaired vision and/or hearing'
      'Mobility/hearing/vision impaired':
        name: 'Mobility, Hearing and/or Vision Impairments'
        description: 'impaired mobility, hearing and/or vision'
      'Mobility impaired':
        name: 'Mobility Impairments'
        description: 'impaired mobility'

    return priority unless labelMap[priority]
    return labelMap[priority][modifier]

  $scope.priorityTypes = (listing) ->
    ListingService.priorityTypes(listing)

  $scope.priorityTypeNames = (listing) ->
    names = _.map $scope.priorityTypes(listing), (priority) ->
      $scope.priorityLabel(priority, 'name')
    names.join(', ')

  $scope.seniorMinimumAge = (listing = $scope.listing) ->
    if listing.Reserved_community_minimum_age
      "#{listing.Reserved_community_minimum_age}+"
    else
      ''

  $scope.trackApplyOnlineTimer = ->
    AnalyticsService.trackTimerEvent('Application', 'Apply Online Click')

  # TODO: -- REMOVE HARDCODED FEATURES --
  $scope.listingIsFirstComeFirstServe = (listing = $scope.listing) ->
    ListingService.listingIsFirstComeFirstServe(listing)

  $scope.listingIs = (name) ->
    ListingService.listingIs(name)
  # ---

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
