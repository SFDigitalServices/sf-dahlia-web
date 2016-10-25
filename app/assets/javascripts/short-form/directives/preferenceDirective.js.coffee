angular.module('dahlia.directives')
.directive 'parentPreference', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/preference.html'

  link: (scope, elem, attrs, ctrl, transclude) ->
    scope.init = ->
      scope.setup_preference_variables(scope.preference)
      transclude(scope, (clone, scope) ->
        elem.append(clone)
      )

    scope.on_livework_preference_change = ->
      scope.refresh_member_dropdown()
      scope.application.preferences.liveWorkInSf_preference = null
      scope.reset_livework_data()

    scope.select_liveWork_preference = () ->
      scope.reset_livework_data()
      preference = scope.application.preferences.liveWorkInSf_preference
      scope.preference = preference
      scope.setup_preference_variables(preference)
      scope.preferences[preference] = true

    scope.refresh_member_dropdown = ->
      oneEligibleWithHouseholdMembers = (scope.eligible_members().length == 1) && (scope._householdSize() > 1)
      if oneEligibleWithHouseholdMembers
        eligibleMember = scope.eligible_members()[0]
        scope.application.preferences[scope.preference_household_member] = "#{eligibleMember.firstName} #{eligibleMember.lastName}"
      else
        scope.application.preferences[scope.preference_household_member] = null

    scope.setup_preference_variables = (type) ->
      # type may be undefined which will reset the liveWorkInSf dropdown to "Select One"
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

    scope._householdSize = ->
      scope.application.householdMembers.length + 1

    scope.init()
