angular.module('dahlia.directives')
.directive 'checkboxPreferenceItem', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/checkbox-preference-item.html'

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.pref_type = attrs.type
    scope.pref_type_household_member = "#{scope.pref_type}_household_member"
