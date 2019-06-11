angular.module('dahlia.directives')
.directive 'lotteryResultsRow', ->
  scope:
    bucketResult: '<'
    isGeneral: '<'
    itemType: '@'
    prefName: '@'
  templateUrl: 'listings/directives/lottery-results-row.html'

  link: (scope, elem, attrs) ->
    scope.isRank = (scope.itemType == 'rank')
    scope.isBucket = (scope.itemType == 'bucket')
    scope.showGeneralNotice = (scope.isGeneral && scope.isBucket)

    scope.rankForPreference = ->
      results = scope.bucketResult.preferenceResults
      if !_.isEmpty(results) then results[0].preferenceRank else undefined

    scope.prefName ?= scope.bucketResult.preferenceName
    if scope.isBucket
      scope.visible = scope.bucketResult.preferenceResults.length
    else if scope.isRank
      scope.visible = scope.rankForPreference()

    scope.unitsAvailable = scope.bucketResult.unitsAvailable
    scope.totalSubmittedApps = scope.bucketResult.totalSubmittedApps
