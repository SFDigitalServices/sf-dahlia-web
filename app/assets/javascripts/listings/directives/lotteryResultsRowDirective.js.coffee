angular.module('dahlia.directives')
.directive 'lotteryResultsRow', ->
  scope: true
  replace: true
  templateUrl: 'listings/directives/lottery-results-row.html'

  link: (scope, elem, attrs) ->
    scope.prefName = attrs.prefName
    scope.abbrPrefName = attrs.abbrPrefName
    scope.itemType = attrs.itemType

    scope.isRank = ->
      scope.itemType == 'rank'

    scope.isBucket = ->
      scope.itemType == 'bucket'

    scope.isGeneral = ->
      scope.abbrPrefName == 'generalLottery'

    scope.showGeneralNotice = ->
      scope.isGeneral() && scope.isBucket()

    scope.show = ->
      return true if scope.isBucket() && scope.appTotal()
      return true if scope.isRank() && scope.rankForPreference()
      false

    scope.unitsAvailable = () ->
      scope.lotteryBuckets[scope.abbrPrefName + 'UnitsAvailable']

    scope.rankForPreference = () ->
      listingBucketResults = scope.listing.Lottery_Ranking.bucketResults
      preferenceBucketResults = _.find(listingBucketResults, { 'preferenceName': scope.prefName })
      if preferenceBucketResults[0]['preferenceRank']
        preferenceBucketResults[0]['preferenceRank']
      else
        undefined

    scope.appTotal = () ->
      scope.lotteryBuckets[scope.abbrPrefName + 'AppTotal']
