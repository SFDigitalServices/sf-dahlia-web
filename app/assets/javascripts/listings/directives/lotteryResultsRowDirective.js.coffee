angular.module('dahlia.directives')
.directive 'lotteryResultsRow', ->
  scope:
    bucketResult: '<'
    itemType: '@'
  templateUrl: 'listings/directives/lottery-results-row.html'

  link: (scope, elem, attrs) ->

    scope.isRank = ->
      scope.itemType == 'rank'

    scope.isBucket = ->
      scope.itemType == 'bucket'

    scope.isGeneral = ->
      # TBD?? this is no longer a thing
      # scope.abbrPrefName == 'generalLottery'

      # scope.preferenceName == 'General Lottery' # <-- might be like this?
      false

    scope.showGeneralNotice = ->
      scope.isGeneral() && scope.isBucket()

    scope.show = ->
      return true if scope.isBucket() && scope.bucketResult.bucketResults.length
      return true if scope.isRank() && scope.rankForPreference()
      false

    scope.unitsAvailable = ->
      scope.bucketResult.unitsAvailable

    scope.rankForPreference = ->
      results = scope.bucketResult.bucketResults
      if !_.isEmpty(results) then results[0].preferenceRank else undefined

    scope.appTotal = ->
      scope.bucketResult.appTotal
