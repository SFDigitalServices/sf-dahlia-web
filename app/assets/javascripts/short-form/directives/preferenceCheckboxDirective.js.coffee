angular.module('dahlia.directives')
.directive 'preferenceCheckbox', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/preference-checkbox.html'

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.preference = attrs.preference
    scope.labelledby = attrs.labelledby
    scope.pref_data_event = attrs.dataevent
