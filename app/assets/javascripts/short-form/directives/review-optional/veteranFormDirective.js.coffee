angular.module('dahlia.directives')
.directive 'veteranForm', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/review-optional/veteran-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user
