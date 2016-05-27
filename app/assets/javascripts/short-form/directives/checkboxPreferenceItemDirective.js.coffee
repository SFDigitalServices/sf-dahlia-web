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
    scope.pref_type_proof_option = "#{scope.pref_type}_proof_option"
    scope.show_preferences_options = (applicant) ->
      return false if !applicant.preferences
      applicant.preferences[scope.pref_type] && attrs.uploadProof
