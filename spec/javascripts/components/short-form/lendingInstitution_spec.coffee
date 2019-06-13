do ->
  'use strict'
  describe 'Legal Section Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeLendingInstitutions = getJSONFixture('short_form-api-lending-institutions.json')
    institutionWithInactiveAgent = 'Homestreet Bank'
    institutionWithActiveAgent = 'First Republic Bank'

    fakeShortFormApplicationService =
      lendingInstitutions: fakeLendingInstitutions

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ShortFormApplicationService: fakeShortFormApplicationService
      }

    describe 'lendingInstitutions', ->
      beforeEach ->
        ctrl = $componentController 'lendingInstitutions', locals

      describe '$ctrl.agentIsInactive', ->
        describe 'inactive agent', ->
          it 'returns true', ->
            agentIsInactive = ctrl.agentIsInactive(ctrl.lendingInstitutions[institutionWithInactiveAgent])
            expect(agentIsInactive).toEqual(true)
        describe 'active agent', ->
          it 'returns false', ->
            agentIsInactive = ctrl.agentIsInactive(ctrl.lendingInstitutions[institutionWithActiveAgent])
            expect(agentIsInactive).toEqual(false)