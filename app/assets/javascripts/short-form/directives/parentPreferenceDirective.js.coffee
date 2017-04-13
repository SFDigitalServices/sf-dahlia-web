angular.module('dahlia.directives')
.directive 'parentPreference',
['$translate', ($translate) ->
  replace: true
  # share scope w/ parent e.g. "preferenceWithProof"
  scope: false
  transclude: true
  # template is just one <div>
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

    scope.select_liveWork_preference = (opts = {}) ->
      scope.reset_livework_data() if opts.reset
      scope.checkForLiveOrWorkValues()
      # liveWorkInSf_preference will be 'liveInSf', 'workInSf' or null/undefined
      preference = scope.preferences.liveWorkInSf_preference
      if preference
        scope.preference = preference
        scope.setup_preference_variables(preference)
        scope.preferences[preference] = true
        scope.refreshInputLabels()

    scope.refreshInputLabels = ->
      # this mainly needs to be refreshed for the combo liveWork preference
      if scope.preference == 'liveInSf'
        scope.proofOptionLabel = $translate.instant('LABEL.PREFERENCE_PROOF_ADDRESS_DOCUMENTS')
      else if scope.preference == 'workInSf'
        scope.proofOptionLabel = $translate.instant('LABEL.PREFERENCE_PROOF_DOCUMENTS')

    scope.checkForLiveOrWorkValues = ->
      prefs = scope.preferences
      # have to check for the case where you had already chosen live or work (individual)
      # but now have changed your eligibility to where you will see the liveWork combo
      if scope.showPreference('liveWorkInSf')
        if !prefs.liveWorkInSf_preference && (prefs.liveInSf || prefs.workInSf)
          preference = 'liveInSf' if prefs.liveInSf
          preference = 'workInSf' if prefs.workInSf
          prefs.liveWorkInSf_preference = preference
          prefs.liveWorkInSf = true
      else
        # if liveWork combo is no longer shown then reset its values
        prefs.liveWorkInSf_preference = null
        prefs.liveWorkInSf = null

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
      scope.proof_file = scope.application.preferences[scope.preference_proof_file]
      scope.opts =
        preference_proof_file: scope.preference_proof_file
        preference: scope.preference

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

    scope.liveOrNeighborhoodPreference = ->
      scope.preference == 'liveInSf' || scope.preference == 'neighborhoodResidence'

    scope.assistedHousingRentBurdenPreference = ->
      scope.preference == 'assistedHousing' || scope.preference == 'rentBurden'

    scope.init()
]
