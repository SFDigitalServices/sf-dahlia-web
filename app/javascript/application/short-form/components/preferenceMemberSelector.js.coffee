angular.module('dahlia.components')
.component 'preferenceMemberSelector',
  bindings:
    application: '<'
    eligibleMembers: '<'
    preference: '@'
    label: '@'
  template: require('html-loader!application/short-form/components/preference-member-selector.html')

  controller:
    ['ShortFormApplicationService',
    (ShortFormApplicationService) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @$onChanges = =>
        @preferenceHouseholdMember = "#{@preference}_household_member"

      @onMemberSelect = ->
        if @preference == 'neighborhoodResidence' || @preference == 'antiDisplacement'
          # if we're selecting a member for NRHP/ADHP, it also copys info for liveInSf
          ShortFormApplicationService.copyNeighborhoodToLiveInSf(@preference)

      return ctrl
  ]
