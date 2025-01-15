do ->
  'use strict'
  describe 'LendingInstitutionService', ->
    LendingInstitutionService = undefined
    httpBackend = undefined

    lendingInstitutions = {
      'Lending Institution A': [
        {
          "Id": "lender_a1",
          "FirstName": "Lana",
          "LastName": "Lender 1",
          "Status": "Active",
          "Lending_Agent_Inactive_Date": null
        },
        {
          "Id": "lender_a2",
          "FirstName": "Larry",
          "LastName": "Lender 2",
          "Status": "Active",
          "Lending_Agent_Inactive_Date": null
        }
      ],
      'Lending Institution B': [
        {
          "Id": "lender_b1",
          "FirstName": "Barry",
          "LastName": "B1",
          "Status": "Active",
          "Lending_Agent_Inactive_Date": null
        },
        {
          "Id": "lender_b2",
          "FirstName": "Barbara",
          "LastName": "B2",
          "Status": "Active",
          "Lending_Agent_Inactive_Date": null
        }
      ]
    }

    beforeEach module('dahlia.services')

    beforeEach inject((_$httpBackend_, _LendingInstitutionService_) ->
      httpBackend = _$httpBackend_
      LendingInstitutionService = _LendingInstitutionService_
      LendingInstitutionService.lendingInstitutions = lendingInstitutions
    )

    describe 'Service.getLendingInstitutions', ->
      beforeEach (done) ->
        LendingInstitutionService.lendingInstitutions = {}
        stubAngularAjaxRequest httpBackend, "/api/v1/short-form/lending_institutions", lendingInstitutions
        LendingInstitutionService.getLendingInstitutions()
        done()

      afterAll ->
        LendingInstitutionService.lendingInstitutions = lendingInstitutions

      it 'assigns Service.lendingInstitutions with the lending institutions results', ->
        httpBackend.flush()
        expect(LendingInstitutionService.lendingInstitutions).toEqual lendingInstitutions

    describe 'Service.getLendingInstitutions for DALP listing', ->
      beforeEach (done) ->
        LendingInstitutionService.lendingInstitutions = {}
        stubAngularAjaxRequest httpBackend, "/api/v1/short-form/lending_institutions_dalp", lendingInstitutions
        LendingInstitutionService.getLendingInstitutions(true)
        done()

      afterAll ->
        LendingInstitutionService.lendingInstitutions = lendingInstitutions

      it 'assigns Service.lendingInstitutions with the lending institutions results', ->
        httpBackend.flush()
        expect(LendingInstitutionService.lendingInstitutions).toEqual lendingInstitutions

    describe 'Service.getLendingAgentName', ->
      it 'should return the name of a lending agent, given the ID', ->
        expect(LendingInstitutionService.getLendingAgentName('lender_a1')).toBe('Lana Lender 1')
        expect(LendingInstitutionService.getLendingAgentName('lender_b2')).toBe('Barbara B2')
      it 'should fail gracefully if the given agent ID is not found', ->
        expect(LendingInstitutionService.getLendingAgentName('not a real id')).toBe(undefined)

    describe 'Service.getLendingInstitution', ->
      it 'given an agent ID, it should return the name of the lending institution that the agent belongs to', ->
        expect(LendingInstitutionService.getLendingInstitution('lender_a1')).toBe('Lending Institution A')
        expect(LendingInstitutionService.getLendingInstitution('lender_b2')).toBe('Lending Institution B')
      it 'should fail gracefully if the given agent ID is not found', ->
        expect(LendingInstitutionService.getLendingInstitution('not a real id')).toBe(undefined)

