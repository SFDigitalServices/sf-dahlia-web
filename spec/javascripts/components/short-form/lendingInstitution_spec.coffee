do ->
  'use strict'
  describe 'Lending Institution Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeLendingInstitutions = getJSONFixture('short_form-api-lending-institutions.json')
    institutionWithInactiveAgent = 'Homestreet Bank'
    institutionWithActiveAgent = 'First Republic Bank'

    fakeLendingInstitutionService =
      lendingInstitutions: fakeLendingInstitutions
    fakeShortFormApplicationService =
      listing: {'Lottery_Date': '2019-04-30'}

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        LendingInstitutionService: fakeLendingInstitutionService
        ShortFormApplicationService: fakeShortFormApplicationService
      }
    )

    describe 'lendingInstitutions', ->
      beforeEach ->
        ctrl = $componentController 'lendingInstitution', locals
        ctrl.application = {}

      describe '$ctrl.agentIsInactive', ->
        it 'returns true for inactive agent', ->
          ctrl.selectedInstitution = institutionWithInactiveAgent
          ctrl.onChangeLendingInstitution()
          agent = ctrl.lendingInstitutions[institutionWithInactiveAgent][0]
          expect(ctrl.agentIsInactive(agent.Id)).toEqual(true)
        it 'returns false for active agent', ->
          ctrl.selectedInstitution = institutionWithActiveAgent
          ctrl.onChangeLendingInstitution()
          agent = ctrl.lendingInstitutions[institutionWithActiveAgent][0]
          expect(ctrl.agentIsInactive(agent.Id)).toEqual(false)

      describe '$ctrl.agentInactiveDate', ->
        it 'returns inactive date', ->
          ctrl.selectedInstitution = institutionWithInactiveAgent
          ctrl.onChangeLendingInstitution()
          agent = ctrl.lendingInstitutions[institutionWithInactiveAgent][0]
          expect(ctrl.agentInactiveDate(agent.Id)).toEqual('2018-06-01')
