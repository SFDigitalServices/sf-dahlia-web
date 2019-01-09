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
  #lottery modal
  $scope.lotteryBucketInfo = ListingService.lotteryBucketInfo
  #lottery modal
  $scope.lotteryRankingInfo = ListingService.lotteryRankingInfo
  $scope.favorites = ListingService.favorites

  # lottery results ranking
  # for expanding the "What happens next"
  $scope.whatHappens = false

  # lottery modal
  # for searching lottery number
  $scope.lotterySearchNumber = ''
  $scope.lotteryNumberFormatValid = true
  $scope.loading = ListingService.loading
  $scope.error = ListingService.error

  #used in Favorites
  $scope.isFavorited = (listing_id) ->
    ListingService.isFavorited(listing_id)

  # lottery search
  $scope.clearLotteryRankingInfo = ->
    angular.copy({}, $scope.lotteryRankingInfo)

  $scope.preferenceBucketResults = (prefName) ->
    preferenceBucketResults = _.find($scope.lotteryRankingInfo.lotteryBuckets, { 'preferenceName': prefName })
    if preferenceBucketResults then preferenceBucketResults.preferenceResults else []

  # applicantHasCertofPrefs
  $scope.applicantSelectedForPreference = ->
    preferenceBucketResults = _.filter($scope.lotteryRankingInfo.lotteryBuckets, (bucket) ->
      return false unless bucket.preferenceResults[0]
      bucket.preferenceName != 'generalLottery' && bucket.preferenceResults[0].preferenceRank != null
    )
    preferenceBucketResults.length > 0

  #lottery-results-ranking
  $scope.applicantHasCertOfPreference = ->
    results = $scope.preferenceBucketResults('Certificate of Preference (COP)')[0]
    results && results.preferenceRank

  #lottery-results-ranking
  $scope.lotteryNumberValid = ->
    return unless $scope.lotteryRankingInfo && $scope.lotteryRankingInfo.lotteryBuckets
    # true if there are any lotteryBuckets
    _.some($scope.lotteryRankingInfo.lotteryBuckets, (bucket) -> !_.isEmpty(bucket.preferenceResults))

  # retrieve lottery ranking to display in lottery results modal
  $scope.showLotteryRanking = ->
    $scope.lotterySearchNumber = ListingService.formatLotteryNumber($scope.lotterySearchNumber)
    if $scope.lotterySearchNumber == ''
      $scope.lotteryNumberFormatValid = false
      $scope.clearLotteryRankingInfo()
    else
      $scope.lotteryNumberFormatValid = true
      ListingService.getLotteryRanking($scope.lotterySearchNumber).then( ->
        AnalyticsService.trackInvalidLotteryNumber() if !$scope.lotteryNumberValid()
      )

  # used within lottery modal to determine some template variations
  $scope.viewingMyApplications = ->
    $state.current.name == 'dahlia.my-applications'

  #income-table-multiple
  $scope.incomeForHouseholdSize = (amiChart, householdIncomeLevel) ->
    ListingService.incomeForHouseholdSize(amiChart, householdIncomeLevel)


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
