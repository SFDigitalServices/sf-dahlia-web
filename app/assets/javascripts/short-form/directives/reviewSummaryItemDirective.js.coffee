angular.module('dahlia.directives')
.directive 'reviewSummaryItem', ->
  replace: true
  scope:
    label: '@'
    subLabel: '@'
    boldSubLabel: '@'
    identifier: '@'
    getLabels: '&'
  transclude: true
  templateUrl: 'short-form/directives/review-summary-item.html'

  link: (scope, elem, attrs) ->
    scope.labels = scope.getLabels() if scope.getLabels
