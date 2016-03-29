angular.module('dahlia.directives')
.directive 'raceEthnicityForm', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/race-ethnicity-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user
    scope.pronoun = attrs.pronoun
