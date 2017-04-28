angular.module('dahlia.directives')
.directive 'reviewSummaryItem', ->
  replace: true
  scope:
    label: '@'
    subLabel: '@'
    boldSubLabel: '@'
    identifier: '@'
    getSubLabels: '&'
  transclude: true
  templateUrl: 'short-form/directives/review-summary-item.html'

  link: (scope, elem, attrs) ->
    scope.boldSubLabels = scope.getSubLabels() if scope.getSubLabels
