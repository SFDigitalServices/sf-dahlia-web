angular.module('dahlia.directives')
.directive 'preferenceMemberSelector', ->
  scope: true
  templateUrl: 'short-form/directives/preference-member-selector.html'

  link: (scope, elem, attrs) ->
    scope.label = attrs.label
    scope.only_applicant_eligible = () ->
      onlyApplicantIsEligible = (scope.eligible_members().length == 1) && (scope.eligible_members()[0] == scope.applicant)
      eligibleAndOnlyApplicant = (scope._householdSize() == 1) && onlyApplicantIsEligible
      if eligibleAndOnlyApplicant
        # even though the form input is hidden we automatically set the value to the applicant
        scope.preferences[scope.preference_household_member] = "#{scope.applicant.firstName} #{scope.applicant.lastName}"
      eligibleAndOnlyApplicant
