angular.module('dahlia.directives')
.directive 'lotteryPreference', ->
  scope: true
  replace: true
  templateUrl: 'listings/directives/lottery-preference.html'

  # link: (scope, elem, attrs) ->
