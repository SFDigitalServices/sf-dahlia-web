angular.module('dahlia.directives')
.directive 'preferenceCheckbox', ->
  scope: true
  templateUrl: 'short-form/directives/preference-checkbox.html'

  link: (scope, elem, attrs) ->
