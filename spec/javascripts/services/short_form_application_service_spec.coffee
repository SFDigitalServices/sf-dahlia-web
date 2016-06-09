do ->
  'use strict'
  describe 'ShortFormApplicationService', ->
    ShortFormApplicationService = undefined
    $localStorage = undefined
    fakeHouseholdMember = undefined
    fakeAddress =
      address1: '123 Main St.'
      city: 'San Francisco'
      state: 'CA'
      zip: '94109'

    beforeEach module('dahlia.services', ($provide)->
      return
    )

    beforeEach inject((_ShortFormApplicationService_, _$localStorage_) ->
      $localStorage = _$localStorage_
      ShortFormApplicationService = _ShortFormApplicationService_
      # have to clear out local storage beforeEach test
      $localStorage.application = ShortFormApplicationService.applicationDefaults
      return
    )

    describe 'Service setup', ->
      it 'initializes applicant defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults.applicant
        expect(ShortFormApplicationService.applicant).toEqual expectedDefault
        return

      it 'initializes application defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults
        expect(ShortFormApplicationService.application).toEqual expectedDefault
        return

      it 'initializes alternateContact defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults.alternateContact
        expect(ShortFormApplicationService.alternateContact).toEqual expectedDefault
        return
      return

    describe 'userCanAccessSection', ->
      it 'initializes completedSections defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults.completedSections
        ShortFormApplicationService.userCanAccessSection({})
        expect(ShortFormApplicationService.application.completedSections).toEqual expectedDefault
        return

      it 'does not initially allow access to later sections', ->
        expect(ShortFormApplicationService.userCanAccessSection({name: 'Income'})).toEqual false
        return
      return


    describe 'copyHomeToMailingAddress', ->
      it 'copies applicant home address to mailing address', ->
        ShortFormApplicationService.applicant.home_address = fakeAddress
        ShortFormApplicationService.copyHomeToMailingAddress()
        expect(ShortFormApplicationService.applicant.mailing_address).toEqual ShortFormApplicationService.applicant.home_address
        return
      return

    describe 'validMailingAddress', ->
      it 'invalidates if all mailing address required values are not present', ->
        expect(ShortFormApplicationService.validMailingAddress()).toEqual false
        return
      it 'validates if all mailing address required values are present', ->
        ShortFormApplicationService.applicant.mailing_address = fakeAddress
        expect(ShortFormApplicationService.validMailingAddress()).toEqual true
        return
      return

    describe 'missingPrimaryContactInfo', ->
      it 'informs if phone_number and mailing_address are missing', ->
        expect(ShortFormApplicationService.missingPrimaryContactInfo()).toEqual ['Phone', 'Email', 'Address']
        return

      it 'informs if phone_number and mailing_address are not missing', ->
        ShortFormApplicationService.applicant.mailing_address = fakeAddress
        ShortFormApplicationService.applicant.phone_number = '123-123123'
        ShortFormApplicationService.applicant.email = 'email@email.com'
        expect(ShortFormApplicationService.missingPrimaryContactInfo()).toEqual []
        return
      return

    describe 'getHouseholdMember', ->
      beforeEach ->
        fakeHouseholdMember =
          first_name: 'Bob'
          last_name: 'Williams'
          dob_month: '07'
          dob_day: '05'
          dob_year: '2015'
          relationship: 'Cousin'
          id: 1
        return

      afterEach ->
        fakeHouseholdMember = undefined
        return

      it 'returns the householdMember object', ->
        ShortFormApplicationService.householdMembers = [fakeHouseholdMember]
        expect(ShortFormApplicationService.getHouseholdMember(1)).toEqual fakeHouseholdMember
        return
      return

    describe 'addHouseholdMember', ->
      beforeEach ->
        fakeHouseholdMember =
          first_name: 'Bob'
          last_name: 'Williams'
          dob_month: '07'
          dob_day: '05'
          dob_year: '2015'
          relationship: 'Cousin'
        ShortFormApplicationService.householdMembers = []
        ShortFormApplicationService.householdMember = fakeHouseholdMember
        ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

      afterEach ->
        fakeHouseholdMember = undefined

      it 'clears the householdMember object', ->
        expect(ShortFormApplicationService.householdMember).toEqual {}
        return

      describe 'new household member', ->
        it 'adds an ID to the householdMember object', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.id).toEqual(1)
          return

        it 'adds household member to Service.householdMembers', ->
          expect(ShortFormApplicationService.householdMembers.length).toEqual 1
          expect(ShortFormApplicationService.householdMembers[0]).toEqual fakeHouseholdMember
          return
        return

      describe 'old household member', ->
        beforeEach ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          ShortFormApplicationService.addHouseholdMember(householdMember)

        it 'does not add the member', ->
          expect(ShortFormApplicationService.householdMembers.length).toEqual(1)
          return
        return

    describe 'cancelHouseholdMember', ->
      beforeEach ->
        fakeHouseholdMember =
          first_name: 'Bob'
          last_name: 'Williams'
          dob_month: '07'
          dob_day: '05'
          dob_year: '2015'
          relationship: 'Cousin'
        ShortFormApplicationService.householdMembers = []
        ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)
        ShortFormApplicationService.householdMember = fakeHouseholdMember
        ShortFormApplicationService.cancelHouseholdMember()

      it 'removed household member from list', ->
        expect(ShortFormApplicationService.householdMembers).toEqual []
        return

      it 'should clear householdMember object', ->
        expect(ShortFormApplicationService.householdMember).toEqual {}
        return

    describe 'worksInSf', ->
      describe 'applicant works in SF', ->
        beforeEach ->
          fakeApplicant =
            first_name: 'Bob'
            last_name: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            work_in_sf: 'Yes'
            preferences: {live_in_sf: false, work_in_sf: false}
          ShortFormApplicationService.householdMembers = []
          ShortFormApplicationService.applicant = fakeApplicant

        it 'should assign work_in_sf preference', ->
          ShortFormApplicationService.worksInSf()
          expect(ShortFormApplicationService.applicant.preferences.work_in_sf).toEqual(true)
          return
        return

      describe 'applicant does not work in SF', ->
        beforeEach ->
          fakeApplicant =
            first_name: 'Bob'
            last_name: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            work_in_sf: 'No'
            preferences: {live_in_sf: false, work_in_sf: false}
          ShortFormApplicationService.householdMembers = []
          ShortFormApplicationService.applicant = fakeApplicant

        it 'should not be assigned work_in_sf preference', ->
          ShortFormApplicationService.worksInSf()
          expect(ShortFormApplicationService.applicant.preferences.work_in_sf).toEqual(false)
          return
        return

      describe 'household member works in SF', ->
        beforeEach ->
          fakeApplicant =
            first_name: 'Bob'
            last_name: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            work_in_sf: 'No'
            preferences: {live_in_sf: false, work_in_sf: false}
          fakeHouseholdMember =
            first_name: 'Bob'
            last_name: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            work_in_sf: 'Yes'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)
          ShortFormApplicationService.applicant = fakeApplicant

        it 'should not be assigned work_in_sf preference', ->
          ShortFormApplicationService.worksInSf()
          expect(ShortFormApplicationService.applicant.preferences.work_in_sf).toEqual(true)
          return
        return

    describe 'livesInSf', ->
      describe 'applicant lives in SF', ->
        beforeEach ->
          fakeApplicant =
            first_name: 'Bob'
            last_name: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            work_in_sf: 'Yes'
            preferences: {live_in_sf: false, work_in_sf: false}
            home_address:
              address1: "312 Delaware RD"
              address2: ""
              city: "SAN FRANCISCO"
          ShortFormApplicationService.householdMembers = []
          ShortFormApplicationService.applicant = fakeApplicant

        it 'should be assigned live_in_sf preference', ->
          ShortFormApplicationService.livesInSf()
          expect(ShortFormApplicationService.applicant.preferences.live_in_sf).toEqual(true)
          return
        return

      describe 'applicant does not live in SF', ->
        beforeEach ->
          fakeApplicant =
            first_name: 'Bob'
            last_name: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            work_in_sf: 'No'
            preferences: {live_in_sf: false, work_in_sf: false}
            home_address:
              address1: "312 Delaware RD"
              address2: ""
              city: "Mount Shasta"
          ShortFormApplicationService.householdMembers = []
          ShortFormApplicationService.applicant = fakeApplicant

        it 'should not be assigned live_in_sf preference', ->
          ShortFormApplicationService.livesInSf()
          expect(ShortFormApplicationService.applicant.preferences.live_in_sf).toEqual(false)
          return
        return

        # to write: test for household who lives in SF.

