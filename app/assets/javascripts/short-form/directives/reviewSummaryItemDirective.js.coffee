angular.module('dahlia.directives')
.directive 'reviewSummaryItem', ->
  replace: true
  scope:
    label: '@'
    subLabel: '@'
    boldSubLabel: '@'
    rentBurdenSubLabels: '='
    identifier: '@'
  transclude: true
  templateUrl: 'short-form/directives/review-summary-item.html'
