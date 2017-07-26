angular.module('dahlia.components')
.component 'preferenceMemberSelector',
  bindings:
    application: '<'
    eligibleMembers: '<'
    preference: '@'
    label: '@'
  templateUrl: 'short-form/components/preference-member-selector.html'

  controller:
    ['ShortFormApplicationService',
    (ShortFormApplicationService) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @$onChanges = =>
        @preferenceHouseholdMember = "#{@preference}_household_member"

      return ctrl
  ]
