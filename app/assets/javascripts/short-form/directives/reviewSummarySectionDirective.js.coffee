angular.module('dahlia.directives')
.directive 'reviewSummarySection', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/review-summary-section.html'

  link: (scope, elem, attrs) ->
    scope.header = attrs.header
    scope.uiSref = attrs.uiSref
