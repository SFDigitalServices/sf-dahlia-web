angular.module('dahlia.directives')
.directive 'checkboxPreferenceItem', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/checkbox-preference-item.html'

  link: (scope, elem, attrs) ->
    # TODO: check if currently selected householdMember no longer exists...
    scope.title = attrs.title
    scope.pref_type = attrs.type
    scope.pref_type_household_member = "#{scope.pref_type}_household_member"
    scope.pref_type_proof_option = "#{scope.pref_type}_proof_option"
    scope.pref_type_proof_file = "#{scope.pref_type}_proof_file"
    scope.labelledby = attrs.labelledby
    scope.show_preferences_options = () ->
      return false if !scope.application.preferences
      scope.application.preferences[scope.pref_type] && attrs.uploadProof
