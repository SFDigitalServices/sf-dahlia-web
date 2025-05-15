############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

LotteryModalController = (
  $scope,
  $state,
  ListingDataService,
  ListingLotteryService,
  AnalyticsService,
  ShortFormApplicationService
) ->
  $scope.listing = ListingDataService.listing
  $scope.application = ShortFormApplicationService.application
  $scope.lotteryBucketInfo = ListingLotteryService.lotteryBucketInfo
  $scope.lotteryRankingInfo = ListingLotteryService.lotteryRankingInfo
  $scope.favorites = ListingDataService.favorites
  $scope.showWhatHappensNextSection = false
  $scope.lotterySearchNumber = ''
  $scope.lotteryNumberFormatValid = true
  $scope.loading = ListingLotteryService.loading
  $scope.error = ListingLotteryService.error

  $scope.applicantHasCertOfPreference = ->
    results = $scope.preferenceBucketResults('Certificate of Preference (COP)')[0]
    results && results.preferenceRank

  $scope.applicantSelectedForPreference = ->
    preferenceBucketResults = _.filter($scope.lotteryRankingInfo[$scope.listing.Id].lotteryBuckets, (bucket) ->
      return false unless bucket.preferenceResults[0]
      bucket.preferenceName != 'generalLottery' && bucket.preferenceResults[0].preferenceRank != null
    )
    preferenceBucketResults.length > 0

  $scope.clearLotteryRankingInfo = ->
    angular.copy({}, $scope.lotteryRankingInfo)

  $scope.preferenceBucketResults = (prefName) ->
    preferenceBucketResults = _.find($scope.lotteryRankingInfo[$scope.listing.Id].lotteryBuckets, { 'preferenceName': prefName })
    if preferenceBucketResults then preferenceBucketResults.preferenceResults else []

  $scope.lotteryNumberValid = ->
    return unless $scope.lotteryRankingInfo && $scope.lotteryRankingInfo[$scope.listing.Id].lotteryBuckets
    # true if there are any lotteryBuckets
    _.some($scope.lotteryRankingInfo[$scope.listing.Id].lotteryBuckets, (bucket) -> !_.isEmpty(bucket.preferenceResults))

  # retrieve lottery ranking to display in lottery results modal
  $scope.showLotteryRanking = ->
    $scope.lotterySearchNumber = ListingLotteryService.formatLotteryNumber($scope.lotterySearchNumber)
    if $scope.lotterySearchNumber == ''
      $scope.lotteryNumberFormatValid = false
      $scope.clearLotteryRankingInfo()
    else
      $scope.lotteryNumberFormatValid = true
      ListingLotteryService.getLotteryRanking($scope.lotterySearchNumber, $scope.listing)

  # used within lottery modal to determine some template variations
  $scope.viewingMyApplications = ->
    $state.current.name == 'dahlia.my-applications'

############################################################################################
######################################## CONFIG ############################################
############################################################################################

LotteryModalController.$inject = [
  '$scope',
  '$state',
  'ListingDataService',
  'ListingLotteryService',
  'AnalyticsService',
  'ShortFormApplicationService'
]

angular
  .module('dahlia.controllers')
  .controller('LotteryModalController', LotteryModalController)
