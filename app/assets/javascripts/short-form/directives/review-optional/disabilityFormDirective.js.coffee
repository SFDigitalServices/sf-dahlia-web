angular.module('dahlia.directives')
.directive 'disabilityForm', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/review-optional/disability-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user
