angular.module('dahlia.directives')
.directive 'checkboxPreferenceItem', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/checkbox-preference-item.html'

  link: (scope, elem, attrs) ->
    scope.init = ->
      scope.title = attrs.title
      if attrs.type == 'liveWorkInSf'
        # liveWorkInSf is a special case where the checkbox_pref_type is "liveWorkInSf"
        # but the pref_type is the preference you're selecting: "liveInSf" or "workInSf"
        scope.liveWorkInSf = true
        scope.checkbox_pref_type = 'liveWorkInSf'
        if scope.preferences.liveInSf
          scope.preferences.liveWorkInSf_preference = 'liveInSf'
        else if scope.preferences.workInSf
          scope.preferences.liveWorkInSf_preference = 'workInSf'
        if scope.preferences.liveWorkInSf_preference
          scope.set_pref_type(scope.preferences.liveWorkInSf_preference)
      else
        # otherwise checkbox_pref_type == pref_type
        scope.checkbox_pref_type = attrs.type
        scope.set_pref_type(attrs.type)
      scope.labelledby = attrs.labelledby
      scope.pref_data_event = attrs.dataevent

    scope.show_preferences_options = ->
      return false if !scope.preferences
      return false if scope.liveWorkInSf && !scope.pref_type
      scope.preferences[scope.checkbox_pref_type] && attrs.uploadProof

    scope.show_preference_uploader = ->
      return false if scope.liveWorkInSf && !scope.pref_type
      scope.show_preferences_options(scope.application) &&
        !scope.preferenceFileIsLoading(scope.pref_type_proof_file) &&
        !scope.hasPreferenceFile(scope.pref_type_proof_file)

    scope.eligible_members = () ->
      if scope.pref_type == "liveInSf"
        scope.liveInSfMembers()
      else if scope.pref_type == "workInSf"
        scope.workInSfMembers()
      else if scope.pref_type == "neighborhoodResidence"
        scope.neighborhoodResidenceMembers()
      else
        members = scope.householdMembers.slice()
        # put applicant at the front
        members.unshift(scope.applicant)
        return members

    scope.show_household_member_select = ->
      return false if scope.liveWorkInSf && !scope.pref_type
      return false if scope.only_applicant_eligible()
      return true

    scope.select_liveWork_type = (type) ->
      # on change, totally reset both live/work options
      scope.preferences.workInSf = null
      scope.preferences.liveInSf = null
      scope.reset_preference_data('workInSf')
      scope.reset_preference_data('liveInSf')
      scope.set_pref_type(type)
      # selecting a liveWork pref type is the equivalent to checking the checkbox = true
      scope.preferences[type] = true

    scope.set_pref_type = (type) ->
      # type may be undefined which will reset the liveWorkInSf dropdown to "Select One"
      scope.pref_type = type
      return false unless type
      scope.pref_type_household_member = "#{scope.pref_type}_household_member"
      scope.pref_type_proof_option = "#{scope.pref_type}_proof_option"
      scope.pref_type_proof_file = "#{scope.pref_type}_proof_file"

    scope.only_applicant_eligible = () ->
      applicant_only = (scope.eligible_members().length == 1) && (scope.eligible_members()[0] == scope.applicant)
      if applicant_only
        # even though the form input is hidden we automatically set the value to the applicant
        scope.preferences[scope.pref_type_household_member] = "#{scope.applicant.firstName} #{scope.applicant.lastName}"
      applicant_only

    scope.reset_preference_data = (pref_type) ->
      if pref_type == 'liveWorkInSf'
        # this means you're clicking on the combined live/work checkbox
        scope.preferences.liveWorkInSf_preference = null
        scope.pref_type = null
        scope.reset_preference_data('workInSf')
        scope.reset_preference_data('liveInSf')
        return

      preferencesProofNeeded = [
           'liveInSf',
           'workInSf',
           'neighborhoodResidence'
       ]
      scope.preferences[pref_type + '_household_member'] = null

      if _.includes(preferencesProofNeeded, pref_type)
        scope.preferences[pref_type + '_proof_option'] = null
        scope.deletePreferenceFile(pref_type)

    # --- initialize at the end so we can use functions above ---
    scope.init()
