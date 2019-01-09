############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

LotteryModalController = (
  $scope,
  $state,
  ListingService,
  AnalyticsService
) ->

  $scope.lotteryBucketInfo = ListingService.lotteryBucketInfo
  $scope.lotteryRankingInfo = ListingService.lotteryRankingInfo
  $scope.favorites = ListingService.favorites
  $scope.whatHappens = false
  $scope.lotterySearchNumber = ''
  $scope.lotteryNumberFormatValid = true
  $scope.loading = ListingService.loading
  $scope.error = ListingService.error

  $scope.applicantHasCertOfPreference = ->
    results = $scope.preferenceBucketResults('Certificate of Preference (COP)')[0]
    results && results.preferenceRank

  $scope.applicantSelectedForPreference = ->
    preferenceBucketResults = _.filter($scope.lotteryRankingInfo.lotteryBuckets, (bucket) ->
      return false unless bucket.preferenceResults[0]
      bucket.preferenceName != 'generalLottery' && bucket.preferenceResults[0].preferenceRank != null
    )
    preferenceBucketResults.length > 0

  $scope.clearLotteryRankingInfo = ->
    angular.copy({}, $scope.lotteryRankingInfo)

  $scope.preferenceBucketResults = (prefName) ->
    preferenceBucketResults = _.find($scope.lotteryRankingInfo.lotteryBuckets, { 'preferenceName': prefName })
    if preferenceBucketResults then preferenceBucketResults.preferenceResults else []

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

############################################################################################
######################################## CONFIG ############################################
############################################################################################

LotteryModalController.$inject = [
  '$scope',
  '$state',
  'ListingService',
  'AnalyticsService'
]

angular
  .module('dahlia.controllers')
  .controller('LotteryModalController', LotteryModalController)
