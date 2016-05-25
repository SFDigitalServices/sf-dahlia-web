angular.module('dahlia.directives')
.directive 'reviewSummaryItem', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/review-summary-item.html'

  link: (scope, elem, attrs) ->
    scope.label = attrs.label
    scope.subLabel = attrs.subLabel
