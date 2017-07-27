angular.module('dahlia.directives')
.directive 'reviewSummarySection', ['$state', ($state) ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/review-summary-section.html'

  link: (scope, elem, attrs) ->
    scope.header = attrs.header
    scope.ngHref = $state.href(attrs.to)

    scope.isEditable = ->
      return false if scope.atAutofillPreview()
      # using regex .match made the angular digest loop angry!
      scope.application.status.toLowerCase() == 'draft'
]
