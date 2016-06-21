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
    scope.pref_type_proof_file = "#{scope.pref_type}_proof_file"
    scope.labelledby = attrs.labelledby
    scope.show_preferences_options = (application) ->
      return false if !application.preferences
      application.preferences[scope.pref_type] && attrs.uploadProof

    scope.eligible_members = () ->
      if attrs.type == "live_in_sf"
        scope.liveInSfMembers()
      else if attrs.type == "workInSf"
        scope.workInSfMembers()
      else
        scope.householdMembers

    scope.only_applicant_eligible = () ->
      applicant_only = (scope.eligible_members().length == 1) && (scope.eligible_members()[0] == scope.applicant)
      if applicant_only
        # even though the form input is hidden we automatically set the value to the applicant
        scope.application.preferences[scope.pref_type_household_member] = "#{scope.applicant.first_name} #{scope.applicant.last_name}"
      applicant_only
