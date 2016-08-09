angular.module('dahlia.directives')
.directive 'lotteryResultsRanking', ->
  scope: true
  templateUrl: 'listings/directives/lottery-results-rank.html'

  link: (scope, elem, attrs) ->
    scope.pref_name = attrs.prefName
    scope.abrev_pref_name = attrs.abrevPrefName

    scope.units_available = (abrevPrefName) ->
      scope.listing.Lottery_Ranking[abrevPrefName + 'UnitsAvailable']

    scope.rank_for_preference = (abrevPrefName) ->
      applicationResults = scope.listing.Lottery_Ranking.applicationResults[0]
      if applicationResults
        applicationResults[abrevPrefName + 'Rank']
      else
        undefined

    scope.total_applicants_qualified = (abrevPrefName) ->
      scope.listing.Lottery_Ranking[abrevPrefName + 'AppTotal']

