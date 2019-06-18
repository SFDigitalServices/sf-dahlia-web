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
      listing: {'Lottery_Date': '2019-04-30'}

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ShortFormApplicationService: fakeShortFormApplicationService
      }
    )

    describe 'lendingInstitutions', ->
      beforeEach ->
        ctrl = $componentController 'lendingInstitution', locals
        ctrl.application = {}

      describe '$ctrl.agentIsInactive', ->
        describe 'inactive agent', ->
          it 'returns true', ->
            ctrl.selectedInstitution = institutionWithInactiveAgent
            ctrl.onChangeLendingInstitution()
            agent = ctrl.lendingInstitutions[institutionWithInactiveAgent][0]
            expect(ctrl.agentIsInactive(agent.Id)).toEqual(true)
        describe 'active agent', ->
          it 'returns false', ->
            ctrl.selectedInstitution = institutionWithActiveAgent
            ctrl.onChangeLendingInstitution()
            agent = ctrl.lendingInstitutions[institutionWithActiveAgent][0]
            expect(ctrl.agentIsInactive(agent.Id)).toEqual(false)
