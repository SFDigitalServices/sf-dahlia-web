angular.module('dahlia.directives')
.directive 'lotteryResultsBucket', ->
  scope: true
  templateUrl: 'listings/directives/lottery-results-bucket.html'

  link: (scope, elem, attrs) ->
    scope.pref_name = attrs.prefName
    scope.abrev_pref_name = attrs.abrevPrefName
    scope.units_available = attrs.unitsAvailable

    scope.results_by_preference = (preferenceName) ->
      lotteryBucket = _.filter(scope.lotteryBuckets.bucketResults, {'preferenceName': preferenceName})[0]
      return lotteryBucket.bucketResults
