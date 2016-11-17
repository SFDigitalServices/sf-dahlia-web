do ->
  'use strict'
  describe 'ShortFormApplicationService', ->
    ShortFormApplicationService = undefined
    httpBackend = undefined
    fakeListing = undefined
    fakeShortForm = getJSONFixture('short-form-example.json')
    fakeSalesforceApplication = {application: getJSONFixture('sample-salesforce-short-form.json')}
    validateHouseholdMatch = getJSONFixture('short_form-api-validate_household-match.json')
    $translate = {}
    fakeHouseholdMember = undefined
    fakeAddress =
      address1: '123 Main St.'
      city: 'San Francisco'
      state: 'CA'
      zip: '94109'
    fakeApplicant =
      firstName: 'Bob'
      lastName: 'Williams'
      dob_month: '07'
      dob_day: '05'
      dob_year: '2015'
      relationship: 'Cousin'
      workInSf: 'Yes'
      preferences: {liveInSf: null, workInSf: null}
      home_address: fakeAddress
    fakeListingService =
      listing:
        Id: ''
    fakeDataService =
      formatApplication: -> fakeShortForm
      reformatApplication: -> fakeShortForm
    fakeAnalyticsService =
      trackFormSuccess: jasmine.createSpy()
      trackFormError: jasmine.createSpy()
      trackFormAbandon: jasmine.createSpy()
    uuid = {v4: jasmine.createSpy()}
    requestURL = undefined

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value 'uuid', uuid
      $provide.value 'ListingService', fakeListingService
      $provide.value 'ShortFormDataService', fakeDataService
      $provide.value 'AnalyticsService', fakeAnalyticsService
      return
    )

    beforeEach inject((_$httpBackend_, _ShortFormApplicationService_) ->
      httpBackend = _$httpBackend_
      ShortFormApplicationService = _ShortFormApplicationService_
      requestURL = ShortFormApplicationService.requestURL
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
        ShortFormApplicationService.userCanAccessSection('')
        expect(ShortFormApplicationService.application.completedSections).toEqual expectedDefault
        return

      it 'does not initially allow access to later sections', ->
        expect(ShortFormApplicationService.userCanAccessSection('Income')).toEqual false
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

    describe 'getHouseholdMember', ->
      beforeEach ->
        fakeHouseholdMember =
          firstName: 'Bob'
          lastName: 'Williams'
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
        ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
        fakeHouseholdMember =
          firstName: 'Bob'
          lastName: 'Williams'
          dob_month: '07'
          dob_day: '05'
          dob_year: '2015'
          relationship: 'Cousin'
          hasSameAddressAsApplicant: 'Yes'
          neighborhoodPreferenceMatch: null
        ShortFormApplicationService.householdMembers = []
        ShortFormApplicationService.householdMember = fakeHouseholdMember
        ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

      afterEach ->
        fakeHouseholdMember = undefined
        ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = null

      it 'invalidates the household form', ->
        expect(ShortFormApplicationService.application.completedSections['Household']).toEqual false
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

        it 'copies neighborhoodPreferenceMatch from applicant if hasSameAddressAsApplicant', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.neighborhoodPreferenceMatch).toEqual(ShortFormApplicationService.applicant.neighborhoodPreferenceMatch)
          return

        it 'sets householdMember.noAddress if hasSameAddressAsApplicant = "No Address"', ->
          fakeHouseholdMember.hasSameAddressAsApplicant = 'No Address'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.noAddress).toEqual true
          return
        return

      describe 'old household member update', ->
        it 'copies neighborhoodPreferenceMatch from applicant if hasSameAddressAsApplicant', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
          householdMember.hasSameAddressAsApplicant = 'Yes'
          ShortFormApplicationService.addHouseholdMember(householdMember)
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.neighborhoodPreferenceMatch).toEqual(ShortFormApplicationService.applicant.neighborhoodPreferenceMatch)
          return

        it 'does not copy neighborhoodPreferenceMatch from applicant if hasSameAddressAsApplicant == "No"', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
          householdMember.neighborhoodPreferenceMatch = 'Not Matched'
          householdMember.hasSameAddressAsApplicant = 'No'
          ShortFormApplicationService.addHouseholdMember(householdMember)
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.neighborhoodPreferenceMatch).not.toEqual(ShortFormApplicationService.applicant.neighborhoodPreferenceMatch)
          return

        it 'does not add a new household member', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          ShortFormApplicationService.addHouseholdMember(householdMember)
          expect(ShortFormApplicationService.householdMembers.length).toEqual(1)
          return

        it 'updates the name for any preferences attached to the member', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          currentName = "#{householdMember.firstName} #{householdMember.lastName}"
          # attach household member to the preference
          ShortFormApplicationService.preferences['liveInSf_household_member'] = currentName
          # now update
          householdMember.firstName = 'Robert'
          newName = "#{householdMember.firstName} #{householdMember.lastName}"
          ShortFormApplicationService.addHouseholdMember(householdMember)
          # the name attached to the preference should also update
          expect(ShortFormApplicationService.preferences['liveInSf_household_member']).toEqual(newName)
          return
        return

    describe 'cancelHouseholdMember', ->
      beforeEach ->
        fakeHouseholdMember =
          firstName: 'Bob'
          lastName: 'Williams'
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

    describe 'fullHousehold', ->
      it 'contains the primary applicant', ->
        hh = ShortFormApplicationService.fullHousehold()
        expect(hh.indexOf(ShortFormApplicationService.applicant) > -1).toEqual true

      it 'has array length of household plus one', ->
        hh = ShortFormApplicationService.fullHousehold()
        expect(hh.length).toEqual(ShortFormApplicationService.householdMembers.length + 1)

    describe 'refreshPreferences', ->
      describe 'applicant does not work in SF', ->
        beforeEach ->
          ShortFormApplicationService.householdMembers = []
          ShortFormApplicationService.applicant = fakeApplicant
          ShortFormApplicationService.applicant.workInSf = 'No'

        it 'should not be assigned workInSf preference', ->
          ShortFormApplicationService.refreshPreferences()
          expect(ShortFormApplicationService.application.preferences.workInSf).toEqual(null)
          return
        return

      describe 'applicant does not live in SF', ->
        beforeEach ->
          home_address = {
            address1: "312 Delaware RD"
            address2: ""
            city: "Mount Shasta"
          }
          ShortFormApplicationService.householdMembers = []
          ShortFormApplicationService.applicant = fakeApplicant
          ShortFormApplicationService.applicant.home_address = home_address

        it 'should not be assigned liveInSf preference', ->
          ShortFormApplicationService.refreshPreferences()
          expect(ShortFormApplicationService.application.preferences.liveInSf).toEqual(null)
          return

        describe 'was previously eligible and selected for liveInSf', ->
          beforeEach ->
            home_address = {
              address1: "312 Delaware RD"
              address2: ""
              city: "Mount Shasta"
            }
            ShortFormApplicationService.householdMembers = []
            ShortFormApplicationService.applicant = fakeApplicant
            ShortFormApplicationService.applicant.home_address = home_address
            ShortFormApplicationService.preferences =
              liveInSf: true
              liveInSf_file: 'somefile'
              liveInSf_proof_option: 'proofOption'
              liveInSf_household_member: fakeApplicant.firstName + " " + fakeApplicant.lastName

          it 'clear liveInSf preference data', ->
            ShortFormApplicationService.refreshPreferences()
            expect(ShortFormApplicationService.preferences.liveInSf).toEqual(null)
            expect(ShortFormApplicationService.preferences.liveInSf_proof_file).toEqual(null)
            expect(ShortFormApplicationService.preferences.liveInSf_proof_option).toEqual(null)
            expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual(null)
            return
          return
        return

    describe 'liveInSfMembers', ->
      describe 'household member has separate sf address', ->
        beforeEach ->
          home_address = {
            address1: "312 Delaware RD"
            address2: ""
            city: "Mount Shasta"
          }
          ShortFormApplicationService.applicant = fakeApplicant
          ShortFormApplicationService.applicant.home_address = home_address
          fakeHouseholdMemberWithAltMailingAddress =
            firstName: 'Bob'
            lastName: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            workInSf: 'Yes'
            hasSameAddressAsApplicant: 'No'
            home_address: fakeAddress
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMemberWithAltMailingAddress)
        it 'should return array of household member who lives in SF', ->
          expect(ShortFormApplicationService.liveInSfMembers().length).toEqual(1)
          return
        return

      describe 'household member has the same sf address as the applicant', ->
        beforeEach ->
          home_address = {
            address1: "312 Delaware RD"
            address2: ""
            city: "San Francisco"
          }
          ShortFormApplicationService.applicant = fakeApplicant
          ShortFormApplicationService.applicant.home_address = home_address
          fakeHouseholdMember =
            firstName: 'Bob'
            lastName: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            workInSf: 'Yes'
            hasSameAddressAsApplicant: 'Yes'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)
        it 'should return an array of both applicant and household member', ->
          expect(ShortFormApplicationService.liveInSfMembers().length).toEqual(2)
          return
        return
      return

    describe 'workInSfMembers', ->
      describe 'only applicant works in SF', ->
        beforeEach ->
          fakeHouseholdMember =
            firstName: 'Bob'
            lastName: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            workInSf: 'No'
          ShortFormApplicationService.applicant = fakeApplicant
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)
          ShortFormApplicationService.applicant.workInSf = 'Yes'
        it 'should return array with applicant', ->
          expect(ShortFormApplicationService.workInSfMembers()).toEqual([ShortFormApplicationService.applicant])
          return
        return

      describe 'only household member works in SF', ->
        beforeEach ->
          fakeHouseholdMember =
            firstName: 'Bob'
            lastName: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            workInSf: 'Yes'
          ShortFormApplicationService.applicant = fakeApplicant
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)
          ShortFormApplicationService.applicant.workInSf = 'No'
        it 'should return array with applicant', ->
          expect(ShortFormApplicationService.workInSfMembers()).toEqual([fakeHouseholdMember])
          return
        return

      describe 'both applicant and household member work in SF', ->
        beforeEach ->
          fakeHouseholdMember =
            firstName: 'Bob'
            lastName: 'Williams'
            dob_month: '07'
            dob_day: '05'
            dob_year: '2015'
            relationship: 'Cousin'
            workInSf: 'Yes'
          ShortFormApplicationService.applicant = fakeApplicant
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)
          ShortFormApplicationService.applicant.workInSf = 'Yes'
        it 'should return array with applicant', ->
          expect(ShortFormApplicationService.workInSfMembers().length).toEqual(2)
          return
        return
        # TODO: write test for household who lives in SF.

    describe 'authorizedToProceed', ->
      it 'always allows you to access first page of You section', ->
        toState = {name: 'dahlia.short-form-application.name'}
        fromState = {name: ''}
        toSection = {name: 'You'}
        authorized = ShortFormApplicationService.authorizedToProceed(toState, fromState, toSection)
        expect(authorized).toEqual true

      it 'does not allow you to jump ahead', ->
        toState = {name: 'dahlia.short-form-application.household-intro'}
        fromState = {name: ''}
        toSection = {name: 'Household'}
        authorized = ShortFormApplicationService.authorizedToProceed(toState, fromState, toSection)
        expect(authorized).toEqual false

    describe 'isLeavingShortForm', ->
      it 'should know if you\'re not leaving short form', ->
        toState = {name: 'dahlia.short-form-application.contact'}
        fromState = {name: 'dahlia.short-form-application.name'}
        expect(ShortFormApplicationService.isLeavingShortForm(toState, fromState)).toEqual(false)

      it 'should know if you\'re leaving short form', ->
        toState = {name: 'dahlia.listings'}
        fromState = {name: 'dahlia.short-form-application.name'}
        expect(ShortFormApplicationService.isLeavingShortForm(toState, fromState)).toEqual(true)

      it 'should not trigger if you\'re on the short form intro page', ->
        toState = {name: 'dahlia.listings'}
        fromState = {name: 'dahlia.short-form-welcome.intro'}
        expect(ShortFormApplicationService.isLeavingShortForm(toState, fromState)).toEqual(false)

      it 'should not trigger if you\'re going to save and finish later', ->
        toState = {name: 'dahlia.create-account'}
        fromState = {name: 'dahlia.short-form-welcome.intro'}
        expect(ShortFormApplicationService.isLeavingShortForm(toState, fromState)).toEqual(false)
      return

    describe 'checkSurveyComplete', ->
      it 'should check if survey is incomplete', ->
        ShortFormApplicationService.applicant = fakeApplicant
        ShortFormApplicationService.applicant.gender = {Female: true}
        expect(ShortFormApplicationService.checkSurveyComplete()).toEqual false

      it 'should check if survey is complete', ->
        ShortFormApplicationService.applicant = fakeApplicant
        ShortFormApplicationService.applicant.gender = {Fake: true}
        ShortFormApplicationService.applicant.ethnicity = 'Fake'
        ShortFormApplicationService.applicant.race = 'Fake'
        ShortFormApplicationService.applicant.referral = {Fake: true}
        expect(ShortFormApplicationService.checkSurveyComplete()).toEqual true
      return

    describe 'submitApplication', ->
      beforeEach ->
        fakeListing = getJSONFixture('listings-api-show.json').listing
        ShortFormApplicationService.application = fakeShortForm

      it 'should indicate app status as submitted', ->
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        expect(ShortFormApplicationService.application.status).toEqual('submitted')
        return

      it 'should call formatApplication on ShortFormDataService', ->
        spyOn(fakeDataService, 'formatApplication').and.callThrough()
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        expect(fakeDataService.formatApplication).toHaveBeenCalled()
        return

      it 'should indicate app date submitted to be date today', ->
        dateToday = moment().format('YYYY-MM-DD')
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        expect(ShortFormApplicationService.application.applicationSubmittedDate).toEqual(dateToday)
        return
      return

    describe 'getApplication', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
        return
      it 'should call reformatApplication on ShortFormDataService', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        stubAngularAjaxRequest httpBackend, requestURL, fakeSalesforceApplication
        ShortFormApplicationService.getApplication 'xyz'
        httpBackend.flush()
        expect(fakeDataService.reformatApplication).toHaveBeenCalled()
        return
      return

    describe 'getMyApplicationForListing', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
        return
      it 'should call reformatApplication on ShortFormDataService', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        stubAngularAjaxRequest httpBackend, requestURL, fakeSalesforceApplication
        ShortFormApplicationService.getMyApplicationForListing 'xyz'
        httpBackend.flush()
        expect(fakeDataService.reformatApplication).toHaveBeenCalled()
        return
      return

    describe 'getMyAccountApplication', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
        return
      it 'should load application into accountApplication', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        stubAngularAjaxRequest httpBackend, requestURL, fakeSalesforceApplication
        ShortFormApplicationService.getMyAccountApplication()
        httpBackend.flush()
        expect(fakeDataService.reformatApplication).toHaveBeenCalledWith(fakeSalesforceApplication.application)
        return
      return

    describe 'keepCurrentDraftApplication', ->
      beforeEach ->
        ShortFormApplicationService.application = fakeShortForm
        ShortFormApplicationService.accountApplication = fakeShortForm
        ShortFormApplicationService.accountApplication.id = '99'

      it 'should inherit id from accountApplication', ->
        ShortFormApplicationService.keepCurrentDraftApplication(fakeApplicant)
        expect(ShortFormApplicationService.application.id).toEqual('99')
        return

      it 'should importUserData into current application', ->
        ShortFormApplicationService.keepCurrentDraftApplication(fakeApplicant)
        expect(ShortFormApplicationService.applicant.firstName).toEqual(fakeApplicant.firstName)
        return

    describe 'clearPhoneData', ->
      describe 'type is alternate', ->
        beforeEach ->
          ShortFormApplicationService.applicant.noPhone = true
          ShortFormApplicationService.applicant.alternatePhone = '2222222222'
          ShortFormApplicationService.applicant.alternatePhoneType = 'Home'

        it 'clears noPhone, alternatePhone and alternatePhoneType', ->
          ShortFormApplicationService.clearPhoneData('alternate')
          expect(ShortFormApplicationService.applicant.noPhone).toEqual false
          expect(ShortFormApplicationService.applicant.alternatePhone).toEqual null
          expect(ShortFormApplicationService.applicant.alternatePhoneType).toEqual null
          return
        return

      describe 'type is phone', ->
        beforeEach ->
          ShortFormApplicationService.applicant.additionalPhone = true
          ShortFormApplicationService.applicant.phone = '2222222222'
          ShortFormApplicationService.applicant.phoneType = 'Home'

        it 'clears additionalPhone, phone and phoneType', ->
          ShortFormApplicationService.clearPhoneData('phone')
          expect(ShortFormApplicationService.applicant.additionalPhone).toEqual false
          expect(ShortFormApplicationService.applicant.phone).toEqual null
          expect(ShortFormApplicationService.applicant.phoneType).toEqual null
          return
        return

    describe 'cancelPreference', ->
      beforeEach ->
        ShortFormApplicationService.preferences["liveInSf"] = true
        ShortFormApplicationService.preferences["liveInSf_household_member"] = 'Jane Doe'
        ShortFormApplicationService.preferences["liveInSf_proof_option"] = 'Telephone Bill'
        ShortFormApplicationService.preferences["liveInSf_proof_file"] = 'Some file'

      it 'should clear preference name, household member, proof option and file', ->
        ShortFormApplicationService.cancelPreference("liveInSf")
        expect(ShortFormApplicationService.preferences["liveInSf"]).toEqual null
        expect(ShortFormApplicationService.preferences["liveInSf_household_member"]).toEqual null
        expect(ShortFormApplicationService.preferences["liveInSf_proof_option"]).toEqual null
        expect(ShortFormApplicationService.preferences["liveInSf_proof_file"]).toEqual null
        return

    describe 'checkHouseholdEligiblity', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'should make validate-household api request', ->
        ShortFormApplicationService.application.householdIncome =
          incomeTotal: 22222
          incomeTimeframe: 'per_year'
        requestUrl = "/api/v1/short-form/validate-household"
        stubAngularAjaxRequest httpBackend, requestURL, validateHouseholdMatch
        ShortFormApplicationService.checkHouseholdEligiblity(fakeListing)
        httpBackend.flush()
        expect(ShortFormApplicationService._householdEligibility).toEqual(validateHouseholdMatch)
        return

    describe 'loadApplication', ->
      it 'reformats the application', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadApplication(data)
        expect(fakeDataService.reformatApplication)
          .toHaveBeenCalledWith(data.application, [])
        return

      it 'resets user data', ->
        spyOn(ShortFormApplicationService, 'resetUserData').and.callThrough()
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadApplication(data)
        expect(ShortFormApplicationService.resetUserData).toHaveBeenCalled()
        return

    describe 'loadAccountApplication', ->
      beforeEach ->
        spyOn(fakeDataService, 'reformatApplication').and.returnValue({application: 'someapp'})

      it 'reformats the application', ->
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadAccountApplication(data)
        expect(fakeDataService.reformatApplication)
          .toHaveBeenCalledWith(data.application)
        return

      it 'assigns accountApplication to formatted app', ->
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadAccountApplication(data)
        expect(ShortFormApplicationService.accountApplication)
          .toEqual({application: 'someapp'})
        return
return
