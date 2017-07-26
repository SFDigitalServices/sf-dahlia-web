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

      @preferenceHouseholdMember = "#{@preference}_household_member"

      @onMemberSelect = ->
        if @preference == 'neighborhoodResidence' || @preference == 'antiDisplacement'
          # if we're selecting a member for NRHP/ADHP, it also copys info for liveInSf
          ShortFormApplicationService.copyNeighborhoodToLiveInSf(@preference)

      return ctrl
  ]
