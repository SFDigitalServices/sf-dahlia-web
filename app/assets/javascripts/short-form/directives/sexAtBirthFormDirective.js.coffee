angular.module('dahlia.directives')
.directive 'sexAtBirthForm', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/sex-at-birth-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user
