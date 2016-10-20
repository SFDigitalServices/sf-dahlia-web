angular.module('dahlia.directives')
.directive 'liveWorkPreferenceCheckbox', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/live-work-preference-checkbox.html'

  link: (scope, elem, attrs) ->
    scope.init = ->
      scope.title = attrs.title
      scope.preference = attrs.preference
      scope.labelledby = attrs.labelledby
      scope.pref_data_event = attrs.dataevent
      scope.set_preference(attrs.preference)

    scope.on_preference_change = (preference) ->
      scope.select_liveWork_preference(preference)
      scope.refresh_member_dropdown()

    scope.select_liveWork_preference = (preference) ->
      # on change, totally reset both live/work options
      scope.reset_preference_data('workInSf')
      scope.reset_preference_data('liveInSf')
      unless preference == 'liveWorkInSf'
        scope.set_preference(preference)
        scope.preferences[preference] = true

    scope.reset_preference_data = (preference) ->
      scope.preferences.liveWorkInSf_preference = null
      scope.preferences[preference] = null
      scope.preferences[preference + '_household_member'] = null
      scope.preferences[preference + '_proof_option'] = null
      scope.deletePreferenceFile(preference)

    scope.refresh_member_dropdown = ->
      oneEligibleWithHouseholdMembers = (scope.eligible_members().length == 1) && (scope._householdSize() > 1)
      if oneEligibleWithHouseholdMembers
        eligibleMember = scope.eligible_members()[0]
        scope.application.preferences[scope.preference_household_member] = "#{eligibleMember.firstName} #{eligibleMember.lastName}"
      else
        scope.application.preferences[scope.preference_household_member] = null

    scope.only_applicant_eligible = () ->
      onlyApplicantIsEligible = (scope.eligible_members().length == 1) && (scope.eligible_members()[0] == scope.applicant)
      eligibleAndOnlyApplicant = (scope._householdSize() == 1) && onlyApplicantIsEligible
      if eligibleAndOnlyApplicant
        # even though the form input is hidden we automatically set the value to the applicant
        scope.preferences[scope.preference_household_member] = "#{scope.applicant.firstName} #{scope.applicant.lastName}"
      eligibleAndOnlyApplicant

    scope.set_preference = (type) ->
      # type may be undefined which will reset the liveWorkInSf dropdown to "Select One"
      scope.preference = type
      return false unless type
      scope.preference_household_member = "#{scope.preference}_household_member"
      scope.preference_proof_option = "#{scope.preference}_proof_option"
      scope.preference_proof_file = "#{scope.preference}_proof_file"

    scope.eligible_members = () ->
      if scope.preference == "liveInSf"
        scope.liveInSfMembers()
      else if scope.preference == "workInSf"
        scope.workInSfMembers()
      else if scope.preference == "neighborhoodResidence"
        scope.neighborhoodResidenceMembers()
      else
        members = scope.householdMembers.slice()
        # put applicant at the front
        members.unshift(scope.applicant)
        return members

    scope.show_preference_uploader = ->
      scope.preferences[scope.preference] &&
        !scope.preferenceFileIsLoading(scope.preference_proof_file) &&
        !scope.hasPreferenceFile(scope.preference_proof_file)

    scope._householdSize = ->
      scope.application.householdMembers.length + 1

    scope.init()
