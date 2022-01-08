angular.module('dahlia.directives')
.directive 'sexualOrientationForm', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/review-optional/sexual-orientation-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user
