do ->
  'use strict'
  describe 'ShortFormApplicationService', ->
    $q = undefined
    $rootScope = undefined
    ShortFormApplicationService = undefined
    httpBackend = undefined
    fakeListing = undefined
    fakeCustomPreference = {}
    fakeShortForm = getJSONFixture('sample-web-short-form.json')
    fakeSalesforceApplication = {application: getJSONFixture('sample-salesforce-short-form.json')}
    validateHouseholdMatch = getJSONFixture('short_form-api-validate_household-match.json')
    $translate =
      use: jasmine.createSpy()
    $state =
      params:
        lang: undefined
      go: jasmine.createSpy()
      href: ->
      current: { name: 'dahlia' }
    fakeSFAddress =
      address1: '123 Main St.'
      city: 'San Francisco'
      state: 'CA'
      zip: '94109'
    fakeNonSFAddress =
      address1: '312 Delaware RD'
      address2: ''
      city: 'Mount Shasta'
    fakeApplicant = undefined
    fakeHouseholdMember = undefined
    fakeListingDataService =
      listing:
        Id: ''
      loadListing: ->
    fakeDataService =
      formatApplication: -> fakeSalesforceApplication
      reformatApplication: -> fakeShortForm
      formatUserDOB: ->
      initRentBurdenDocs: jasmine.createSpy()
      checkSurveyComplete: jasmine.createSpy()
    fakeAnalyticsService =
      trackFormSuccess: jasmine.createSpy()
      trackFormError: jasmine.createSpy()
      trackFormAbandon: jasmine.createSpy()
      trackTimeout: jasmine.createSpy()
    fakeFileUploadService =
      uploadProof: jasmine.createSpy()
      deleteFile: jasmine.createSpy()
    fakeRentBurdenFileService =
      deleteRentBurdenPreferenceFiles: jasmine.createSpy()
    fakeSharedService =
      languageMap: {es: 'Spanish'}
    uuid = {v4: jasmine.createSpy()}
    requestURL = undefined
    fakeListingPreferenceService = {
      hasPreference: ->
    }
    setupFakeApplicant = (attributes) ->
      fakeApplicant = _.assign {
        firstName: 'Bob'
        lastName: 'Williams'
        dob_month: '07'
        dob_day: '05'
        dob_year: '2015'
        relationship: 'Cousin'
        workInSf: 'Yes'
        preferences: {liveInSf: null, workInSf: null}
        home_address: fakeSFAddress
      }, attributes
    setupFakeHouseholdMember = (attributes) ->
      fakeHouseholdMember = _.assign {
        firstName: 'Ethel'
        lastName: 'O\'Keefe'
        dob_month: '09'
        dob_day: '27'
        dob_year: '1966'
        relationship: 'Cousin'
      }, attributes
    resetFakePeople = ->
      fakeApplicant = undefined
      fakeHouseholdMember = undefined
    deleteValidatedForms = ->
      delete ShortFormApplicationService.application.validatedForms
    resetValidatedForms = ->
      ShortFormApplicationService.application.validatedForms =
        You: {}
        Household: {}
        Income: {}
        Preferences: {}
        Review: {}

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value '$state', $state
      $provide.value '$translate', $translate
      $provide.value 'uuid', uuid
      $provide.value 'ListingDataService', fakeListingDataService
      $provide.value 'ShortFormDataService', fakeDataService
      $provide.value 'AnalyticsService', fakeAnalyticsService
      $provide.value 'FileUploadService', fakeFileUploadService
      $provide.value 'RentBurdenFileService', fakeRentBurdenFileService
      $provide.value 'SharedService', fakeSharedService
      $provide.value 'ListingPreferenceService', fakeListingPreferenceService
      return
    )

    beforeEach inject((_$q_, _$rootScope_, _$httpBackend_, _ShortFormApplicationService_) ->
      $q = _$q_
      $rootScope = _$rootScope_
      httpBackend = _$httpBackend_
      ShortFormApplicationService = _ShortFormApplicationService_
      requestURL = ShortFormApplicationService.requestURL
    )

    describe 'Service setup', ->
      it 'initializes applicant defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults.applicant
        expect(ShortFormApplicationService.applicant).toEqual expectedDefault

      it 'initializes application defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults
        expect(ShortFormApplicationService.application).toEqual expectedDefault

      it 'initializes alternateContact defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults.alternateContact
        expect(ShortFormApplicationService.alternateContact).toEqual expectedDefault

    describe 'userCanAccessSection', ->
      it 'initializes completedSections defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults.completedSections
        ShortFormApplicationService.userCanAccessSection('')
        expect(ShortFormApplicationService.application.completedSections).toEqual expectedDefault

      it 'does not initially allow access to later sections', ->
        expect(ShortFormApplicationService.userCanAccessSection('Income')).toEqual false

      describe 'when Service.application.validatedForms is empty', ->
        beforeEach ->
          deleteValidatedForms()
        afterEach ->
          resetValidatedForms()

        it 'returns false', ->
          expect(ShortFormApplicationService.userCanAccessSection('You')).toEqual false

    describe 'copyHomeToMailingAddress', ->
      it 'copies applicant home address to mailing address', ->
        ShortFormApplicationService.applicant.home_address = fakeSFAddress
        ShortFormApplicationService.copyHomeToMailingAddress()
        expect(ShortFormApplicationService.applicant.mailing_address).toEqual ShortFormApplicationService.applicant.home_address

    describe 'validMailingAddress', ->
      it 'invalidates if all mailing address required values are not present', ->
        expect(ShortFormApplicationService.validMailingAddress()).toEqual false

      it 'validates if all mailing address required values are present', ->
        ShortFormApplicationService.applicant.mailing_address = fakeSFAddress
        expect(ShortFormApplicationService.validMailingAddress()).toEqual true

    describe 'getHouseholdMember', ->
      beforeEach ->
        setupFakeHouseholdMember({id: 1})
      afterEach ->
        resetFakePeople()

      it 'returns the householdMember object', ->
        ShortFormApplicationService.householdMembers = [fakeHouseholdMember]
        expect(ShortFormApplicationService.getHouseholdMember(1)).toEqual fakeHouseholdMember

    describe 'addHouseholdMember', ->
      beforeEach ->
        setupFakeApplicant({preferenceAddressMatch: 'Matched'})
        ShortFormApplicationService.applicant = fakeApplicant
        setupFakeHouseholdMember(
          hasSameAddressAsApplicant: 'Yes'
          preferenceAddressMatch: null
        )
        ShortFormApplicationService.householdMembers = []
        ShortFormApplicationService.householdMember = fakeHouseholdMember
        ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)
      afterEach ->
        resetFakePeople()

      it 'invalidates the household form', ->
        expect(ShortFormApplicationService.application.completedSections['Household']).toEqual false

      describe 'new household member', ->
        it 'adds an ID to the householdMember object', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.id).toEqual(2)

        it 'adds household member to Service.householdMembers', ->
          expect(ShortFormApplicationService.householdMembers.length).toEqual 1
          expect(ShortFormApplicationService.householdMembers[0]).toEqual fakeHouseholdMember

        it 'copies preferenceAddressMatch from applicant if hasSameAddressAsApplicant', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.preferenceAddressMatch).toEqual(ShortFormApplicationService.applicant.preferenceAddressMatch)

      describe 'old household member update', ->
        it 'copies preferenceAddressMatch from applicant if hasSameAddressAsApplicant', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          ShortFormApplicationService.applicant.preferenceAddressMatch = 'Matched'
          householdMember.hasSameAddressAsApplicant = 'Yes'
          ShortFormApplicationService.addHouseholdMember(householdMember)
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.preferenceAddressMatch).toEqual(ShortFormApplicationService.applicant.preferenceAddressMatch)

        it 'does not copy preferenceAddressMatch from applicant if hasSameAddressAsApplicant == "No"', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          ShortFormApplicationService.applicant.preferenceAddressMatch = 'Matched'
          householdMember.preferenceAddressMatch = 'Not Matched'
          householdMember.hasSameAddressAsApplicant = 'No'
          ShortFormApplicationService.addHouseholdMember(householdMember)
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.preferenceAddressMatch).not.toEqual(ShortFormApplicationService.applicant.preferenceAddressMatch)

        it 'does not add a new household member', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          ShortFormApplicationService.addHouseholdMember(householdMember)
          expect(ShortFormApplicationService.householdMembers.length).toEqual(1)

    describe 'cancelHouseholdMember', ->
      beforeEach ->
        setupFakeHouseholdMember()
        ShortFormApplicationService.householdMembers = []
        ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)
        ShortFormApplicationService.householdMember = fakeHouseholdMember
        ShortFormApplicationService.cancelHouseholdMember()
      afterEach ->
        resetFakePeople()

      it 'removed household member from list', ->
        expect(ShortFormApplicationService.householdMembers).toEqual []

      it 'should clear householdMember object', ->
        expect(ShortFormApplicationService.householdMember).toEqual {}

    describe 'fullHousehold', ->
      it 'contains the primary applicant', ->
        hh = ShortFormApplicationService.fullHousehold()
        expect(hh.indexOf(ShortFormApplicationService.applicant) > -1).toEqual true

      it 'has array length of household plus one', ->
        hh = ShortFormApplicationService.fullHousehold()
        expect(hh.length).toEqual(ShortFormApplicationService.householdMembers.length + 1)

    describe 'fullHousehold', ->
      it 'contains the primary applicant', ->
        hh = ShortFormApplicationService.fullHousehold()
        expect(hh.indexOf(ShortFormApplicationService.applicant) > -1).toEqual true

      it 'has array length of household plus one', ->
        hh = ShortFormApplicationService.fullHousehold()
        expect(hh.length).toEqual(ShortFormApplicationService.householdMembers.length + 1)

    describe 'groupHouseholdAddresses', ->
      it 'sets up groupedHouseholdAddresses array on application', ->
        setupFakeApplicant()
        ShortFormApplicationService.applicant = fakeApplicant
        ShortFormApplicationService.groupHouseholdAddresses()
        expect(ShortFormApplicationService.application.groupedHouseholdAddresses.length).toEqual 1
        correctValue = { fullName: 'Bob Williams (You)', firstName: 'You' }
        expect(ShortFormApplicationService.application.groupedHouseholdAddresses[0].members).toEqual [correctValue]

    describe 'clearAddressRelatedProofForMember', ->
      beforeEach ->
        setupFakeApplicant({ firstName: 'Frank', lastName: 'Robinson', id: 1 })
        ShortFormApplicationService.applicant = fakeApplicant
        # reset the spy so that we can check for "not" toHaveBeenCalled
        fakeFileUploadService.deleteFile = jasmine.createSpy()
      afterEach ->
        resetFakePeople()

      it 'clears the proof file for a preference if the indicated member is selected', ->
        ShortFormApplicationService.preferences.liveInSf_household_member = 1
        ShortFormApplicationService.clearAddressRelatedProofForMember(ShortFormApplicationService.applicant)
        expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual 1
        expect(fakeFileUploadService.deleteFile).toHaveBeenCalledWith(ShortFormApplicationService.listing, { prefType: 'liveInSf' })

      it 'does not clear the proof file for a preference if the indicated member is not selected', ->
        ShortFormApplicationService.preferences.liveInSf_household_member = 2
        ShortFormApplicationService.clearAddressRelatedProofForMember(ShortFormApplicationService.applicant)
        expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual 2
        expect(fakeFileUploadService.deleteFile).not.toHaveBeenCalled()

    describe 'refreshPreferences', ->
      beforeEach ->
        setupFakeApplicant()
      afterEach ->
        resetFakePeople()

      describe 'for applicant who does not work in SF: ', ->
        beforeEach ->
          ShortFormApplicationService.householdMembers = []
          ShortFormApplicationService.applicant = fakeApplicant
          ShortFormApplicationService.applicant.workInSf = 'No'
          ShortFormApplicationService.preferences.workInSf = true

        it 'should not be assigned workInSf preference', ->
          ShortFormApplicationService.refreshPreferences()
          expect(ShortFormApplicationService.application.preferences.workInSf).toEqual(null)

      describe 'for applicant who does not live in SF: ', ->
        beforeEach ->
          fakeApplicant.home_address = fakeNonSFAddress
          ShortFormApplicationService.householdMembers = []
          ShortFormApplicationService.applicant = fakeApplicant
          ShortFormApplicationService.preferences.liveInSf = true

        it 'should not be assigned liveInSf preference', ->
          ShortFormApplicationService.refreshPreferences()
          expect(ShortFormApplicationService.application.preferences.liveInSf).toEqual(null)

        describe 'who was previously eligible and selected for liveInSf', ->
          beforeEach ->
            fakeApplicant.home_address = fakeNonSFAddress
            fakeFileUploadService.deleteFile = jasmine.createSpy()
            ShortFormApplicationService.householdMembers = []
            ShortFormApplicationService.applicant = fakeApplicant
            ShortFormApplicationService.application.completedSections['Preferences'] = true
            ShortFormApplicationService.preferences =
              liveInSf: true
              liveInSf_household_member: 1
              documents: {
                liveInSf: {
                  file: {name: 'img.jpg'}
                  proofOption: 'some option'
                }
              }

          it 'should clear liveInSf preference data', ->
            ShortFormApplicationService.refreshPreferences('liveWorkInSf')
            expect(ShortFormApplicationService.preferences.liveInSf).toEqual(null)
            expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual(null)
            expect(fakeFileUploadService.deleteFile).toHaveBeenCalledWith(ShortFormApplicationService.listing, {prefType: 'liveInSf'})
          it 'invalidates preferences section', ->
            ShortFormApplicationService.refreshPreferences('liveWorkInSf')
            expect(ShortFormApplicationService.application.completedSections['Preferences']).toEqual(false)

    describe 'liveInSfMembers', ->
      beforeEach ->
        setupFakeApplicant()
        setupFakeHouseholdMember
          workInSf: 'Yes'
      afterEach ->
        resetFakePeople()

      describe 'for household member with separate SF address', ->
        beforeEach ->
          fakeApplicant.home_address = fakeNonSFAddress
          ShortFormApplicationService.applicant = fakeApplicant
          fakeHouseholdMember.hasSameAddressAsApplicant = 'No'
          fakeHouseholdMember.home_address = fakeSFAddress
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

        it 'should return array of household member who lives in SF', ->
          expect(ShortFormApplicationService.liveInSfMembers().length).toEqual(1)

      describe 'for household member with same SF address as the applicant', ->
        beforeEach ->
          fakeApplicant.home_address = fakeSFAddress
          ShortFormApplicationService.applicant = fakeApplicant
          fakeHouseholdMember.hasSameAddressAsApplicant = 'Yes'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

        it 'should return an array of both applicant and household member', ->
          expect(ShortFormApplicationService.liveInSfMembers().length).toEqual(2)

    describe 'workInSfMembers', ->
      beforeEach ->
        setupFakeApplicant()
        setupFakeHouseholdMember()
      afterEach ->
        resetFakePeople()

      describe 'only applicant works in SF', ->
        beforeEach ->
          fakeApplicant.workInSf = 'Yes'
          ShortFormApplicationService.applicant = fakeApplicant
          fakeHouseholdMember.workInSf = 'No'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

        it 'should return array with applicant', ->
          expect(ShortFormApplicationService.workInSfMembers()).toEqual([ShortFormApplicationService.applicant])

      describe 'only household member works in SF', ->
        beforeEach ->
          fakeApplicant.workInSf = 'No'
          ShortFormApplicationService.applicant = fakeApplicant
          fakeHouseholdMember.workInSf = 'Yes'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

        it 'should return array with applicant', ->
          expect(ShortFormApplicationService.workInSfMembers()).toEqual([fakeHouseholdMember])

      describe 'both applicant and household member work in SF', ->
        beforeEach ->
          fakeApplicant.workInSf = 'Yes'
          ShortFormApplicationService.applicant = fakeApplicant
          fakeHouseholdMember.workInSf = 'Yes'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

        it 'should return array with applicant', ->
          expect(ShortFormApplicationService.workInSfMembers().length).toEqual(2)

    describe 'liveInTheNeighborhoodMembers', ->
      beforeEach ->
        setupFakeApplicant()
        setupFakeHouseholdMember()
        ShortFormApplicationService.applicant = fakeApplicant
      afterEach ->
        resetFakePeople()

      describe 'applicant doesn\'t have neighborhood preference', ->
        it 'returns array without applicant', ->
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers().length).toEqual(0)

      describe 'applicant doesn\'t match neighborhood preference', ->
        beforeEach ->
          ShortFormApplicationService.applicant.preferenceAddressMatch = 'Not Matched'

        it 'returns array without applicant', ->
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers().length).toEqual(0)

      describe "applicant's address wasn't able to be matched on neighborhood preference", ->
        beforeEach ->
          ShortFormApplicationService.applicant.preferenceAddressMatch = ''

        it 'returns array without applicant', ->
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers().length).toEqual(0)

      describe 'applicant matches neighborhood preference', ->
        beforeEach ->
          ShortFormApplicationService.applicant.preferenceAddressMatch = 'Matched'

        it 'returns array with applicant', ->
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers().length).toEqual(1)
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers()[0]).toEqual(fakeApplicant)

      describe 'household member matches neighborhood preference', ->
        beforeEach ->
          fakeHouseholdMember.preferenceAddressMatch = 'Matched'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

        it 'returns array with household member', ->
          members = ShortFormApplicationService.liveInTheNeighborhoodMembers()
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers().length).toEqual(1)
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers()[0]).toEqual(fakeHouseholdMember)

      describe 'applicant and household member match neighborhood preference', ->
        beforeEach ->
          ShortFormApplicationService.applicant.preferenceAddressMatch = 'Matched'
          fakeHouseholdMember.preferenceAddressMatch = 'Matched'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

        it 'returns array with applicant and household member', ->
          liveInTheNeighborhoodMembers = ShortFormApplicationService.liveInTheNeighborhoodMembers()
          expect(liveInTheNeighborhoodMembers.length).toEqual(2)
          expect(_.find(liveInTheNeighborhoodMembers, {firstName: fakeApplicant.firstName})).toEqual(fakeApplicant)
          expect(_.find(liveInTheNeighborhoodMembers, {firstName: fakeHouseholdMember.firstName})).toEqual(fakeHouseholdMember)

    describe 'eligibleForLiveWork', ->
      beforeEach ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

      it 'returns true if someone is eligible for live/work', ->
        ShortFormApplicationService.applicant.workInSf = 'Yes'
        expect(ShortFormApplicationService.eligibleForLiveWork()).toEqual true

      it 'returns false if nobody is eligible for live/work', ->
        ShortFormApplicationService.applicant.workInSf = 'No'
        expect(ShortFormApplicationService.eligibleForLiveWork()).toEqual false

      it 'returns false if listing does not have liveWorkInSf', ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(false)
        ShortFormApplicationService.applicant.workInSf = 'Yes'
        expect(ShortFormApplicationService.eligibleForLiveWork()).toEqual false

    describe 'eligibleForNRHP', ->
      beforeEach ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

      it 'returns true if someone is eligible for NRHP', ->
        ShortFormApplicationService.applicant.preferenceAddressMatch = 'Matched'
        expect(ShortFormApplicationService.eligibleForNRHP()).toEqual true

      it 'returns false if nobody is eligible for NRHP', ->
        ShortFormApplicationService.applicant.preferenceAddressMatch = 'Not Matched'
        expect(ShortFormApplicationService.eligibleForNRHP()).toEqual false

      it 'returns false if listing does not have NRHP', ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(false)
        ShortFormApplicationService.applicant.preferenceAddressMatch = 'Matched'
        expect(ShortFormApplicationService.eligibleForNRHP()).toEqual false

    describe 'eligibleForADHP', ->
      beforeEach ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

      it 'returns true if someone is eligible for ADHP', ->
        ShortFormApplicationService.applicant.preferenceAddressMatch = 'Matched'
        expect(ShortFormApplicationService.eligibleForADHP()).toEqual true

      it 'returns false if nobody is eligible for ADHP', ->
        ShortFormApplicationService.applicant.preferenceAddressMatch = 'Not Matched'
        expect(ShortFormApplicationService.eligibleForADHP()).toEqual false

      it 'returns false if listing does not have ADHP', ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(false)
        ShortFormApplicationService.applicant.preferenceAddressMatch = 'Matched'
        expect(ShortFormApplicationService.eligibleForADHP()).toEqual false

    describe 'eligibleForAssistedHousing', ->
      it 'returns true if application said yes to public housing', ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)
        # TO DO: update during API integration story for preference
        ShortFormApplicationService.application.hasPublicHousing = 'Yes'
        expect(ShortFormApplicationService.eligibleForAssistedHousing()).toEqual true

      it 'returns false if application does not have assistedHousing', ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)
        # TO DO: update during API integration story for preference
        ShortFormApplicationService.application.hasPublicHousing = 'No'
        expect(ShortFormApplicationService.eligibleForAssistedHousing()).toEqual false

    describe 'eligibleForRentBurden', ->
      beforeEach ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)
        ShortFormApplicationService.application.hasPublicHousing = 'No'
        ShortFormApplicationService.application.householdIncome.incomeTimeframe = 'per_month'
        ShortFormApplicationService.application.groupedHouseholdAddresses = [
          {
            "address": "312 DEETZ RD",
            "members": [
              "You"
            ],
            "monthlyRent": 2000
          }
        ]

      describe 'when rent-to-income ratio is greater than or equal to 50%', ->
        it 'returns true', ->
          ShortFormApplicationService.application.householdIncome.incomeTotal = 3000
          expect(ShortFormApplicationService.eligibleForRentBurden()).toEqual true

      describe 'when rent-to-income ratio is less than 50%', ->
        it 'returns false', ->
          ShortFormApplicationService.application.householdIncome.incomeTotal = 9000
          expect(ShortFormApplicationService.eligibleForRentBurden()).toEqual false

      describe 'when listing does not have rentBurden preference', ->
        it 'returns false', ->
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(false)
          ShortFormApplicationService.application.householdIncome.incomeTotal = 3000
          expect(ShortFormApplicationService.eligibleForRentBurden()).toEqual false

    describe 'copyNeighborhoodToLiveInSf', ->
      beforeEach ->
        ShortFormApplicationService.preferences.neighborhoodResidence = true
        ShortFormApplicationService.preferences.neighborhoodResidence_household_member = 10
        ShortFormApplicationService.preferences.neighborhoodResidence_proofOption = 'Gas Bill'
        ShortFormApplicationService.preferences.documents.neighborhoodResidence = {
          proofOption: 'Gas Bill'
          file: {}
        }

      it 'copies Neighborhood member to liveInSf', ->
        ShortFormApplicationService.copyNeighborhoodToLiveInSf('neighborhoodResidence')
        expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual 10
        expect(ShortFormApplicationService.preferences.liveInSf_proofOption).toEqual 'Gas Bill'
        expect(ShortFormApplicationService.preferences.documents.liveInSf.proofOption).toEqual 'Gas Bill'

    describe 'preferenceRequired', ->
      beforeEach ->
        ShortFormApplicationService.application.preferences.optOut = {}

      it 'returns true if optOutField is not marked', ->
        ShortFormApplicationService.application.preferences.optOut.liveInSf = false
        expect(ShortFormApplicationService.preferenceRequired('liveInSf')).toEqual true

      it 'returns false if optOutField is marked', ->
        ShortFormApplicationService.application.preferences.optOut.liveInSf = true
        expect(ShortFormApplicationService.preferenceRequired('liveInSf')).toEqual false

    describe 'showPreference', ->
      beforeEach ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)
        ShortFormApplicationService.householdMembers = []

        # TODO!
        it 'returns true for liveWorkInSf if you are eligible for both live and work', ->
          setupFakeApplicant({home_address: fakeSFAddress, workInSf: true})
          ShortFormApplicationService.applicant = fakeApplicant
          expect(ShortFormApplicationService.showPreference('liveWorkInSf')).toEqual true

        it 'returns true for liveInSf if you are only eligible for live', ->
          setupFakeApplicant({home_address: fakeSFAddress, workInSf: false})
          ShortFormApplicationService.applicant = fakeApplicant
          expect(ShortFormApplicationService.showPreference('liveInSf')).toEqual true

        it 'returns true for workInSf if you are only eligible for work', ->
          setupFakeApplicant({home_address: fakeNonSFAddress, workInSf: true})
          ShortFormApplicationService.applicant = fakeApplicant
          expect(ShortFormApplicationService.showPreference('workInSf')).toEqual true

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
        toState = {name: 'dahlia.listings-for-rent'}
        fromState = {name: 'dahlia.short-form-application.name'}
        expect(ShortFormApplicationService.isLeavingShortForm(toState, fromState)).toEqual(true)

      it 'should not trigger if you\'re on the short form intro page', ->
        toState = {name: 'dahlia.listings-for-rent'}
        fromState = {name: 'dahlia.short-form-welcome.intro'}
        expect(ShortFormApplicationService.isLeavingShortForm(toState, fromState)).toEqual(false)

      it 'should not trigger if you\'re going to save and finish later', ->
        toState = {name: 'dahlia.create-account'}
        fromState = {name: 'dahlia.short-form-welcome.intro'}
        expect(ShortFormApplicationService.isLeavingShortForm(toState, fromState)).toEqual(false)

    describe 'leaveAndResetShortForm', ->
      it 'should call trackTimeout if timing out', ->
        toState = {name: 'dahlia.listings-for-rent'}
        toParams = {timeout: true}
        ShortFormApplicationService.leaveAndResetShortForm(toState, toParams)
        expect(fakeAnalyticsService.trackTimeout).toHaveBeenCalled()

      it 'should call trackFormAbandon if not timing out', ->
        toState = {name: 'dahlia.listings-for-rent'}
        toParams = {timeout: false}
        ShortFormApplicationService.leaveAndResetShortForm(toState, toParams)
        expect(fakeAnalyticsService.trackFormAbandon).toHaveBeenCalled()

      it 'should call resetApplicationData if not on short form review', ->
        spyOn(ShortFormApplicationService, 'resetApplicationData')
        toState = {name: 'dahlia.listings-for-rent'}
        toParams = {timeout: true}
        ShortFormApplicationService.leaveAndResetShortForm(toState, toParams)
        expect(ShortFormApplicationService.resetApplicationData).toHaveBeenCalled()

      it 'should not call resetApplicationData if on short form review', ->
        spyOn(ShortFormApplicationService, 'resetApplicationData')
        toState = {name: 'dahlia.short-form-review'}
        toParams = {timeout: true}
        ShortFormApplicationService.leaveAndResetShortForm(toState, toParams)
        expect(ShortFormApplicationService.resetApplicationData).not.toHaveBeenCalled()

    describe 'checkSurveyComplete', ->
      it 'should call function on ShortFormDataService', ->
        ShortFormApplicationService.applicant = fakeApplicant
        ShortFormApplicationService.checkSurveyComplete()
        expect(fakeDataService.checkSurveyComplete).toHaveBeenCalledWith(fakeApplicant)

    describe 'submitApplication', ->
      beforeEach ->
        fakeListing = getJSONFixture('listings-api-show.json').listing
        fakeListingDataService.listing = angular.copy(fakeListing)
        deferred = $q.defer()
        deferred.resolve()
        fakeListingPreferenceService.getListingPreferences = jasmine.createSpy().and.returnValue(deferred.promise)
        ShortFormApplicationService._sendApplication = jasmine.createSpy()
        ShortFormApplicationService.application = fakeShortForm

      it 'should indicate app status as submitted', ->
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        expect(ShortFormApplicationService.application.status).toEqual('submitted')

      it 'should call $translate.use() to get current locale', ->
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        expect($translate.use).toHaveBeenCalled()

      it 'should call formatApplication on ShortFormDataService when preferences are defined', ->
        spyOn(fakeDataService, 'formatApplication').and.callThrough()
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        expect(fakeListingPreferenceService.getListingPreferences).not.toHaveBeenCalled()
        expect(fakeDataService.formatApplication).toHaveBeenCalled()
        expect(ShortFormApplicationService._sendApplication).toHaveBeenCalled()

      it 'should call formatApplication on ShortFormDataService when preferences are undefined', ->
        fakeListingDataService.listing.preferences = null
        spyOn(fakeDataService, 'formatApplication').and.callThrough()
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        $rootScope.$apply()
        expect(fakeListingPreferenceService.getListingPreferences).toHaveBeenCalled()
        expect(fakeDataService.formatApplication).toHaveBeenCalled()
        expect(ShortFormApplicationService._sendApplication).toHaveBeenCalled()

      it 'should indicate app date submitted to be date today', ->
        dateToday = moment().tz('America/Los_Angeles').format('YYYY-MM-DD')
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        expect(ShortFormApplicationService.application.applicationSubmittedDate).toEqual(dateToday)

    describe 'getApplication', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'should call reformatApplication on ShortFormDataService', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        stubAngularAjaxRequest httpBackend, requestURL, fakeSalesforceApplication
        ShortFormApplicationService.getApplication 'xyz'
        httpBackend.flush()
        expect(fakeDataService.reformatApplication).toHaveBeenCalled()

    describe 'getMyApplicationForListing', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'should call reformatApplication on ShortFormDataService', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        stubAngularAjaxRequest httpBackend, requestURL, fakeSalesforceApplication
        ShortFormApplicationService.getMyApplicationForListing 'xyz'
        httpBackend.flush()
        expect(fakeDataService.reformatApplication).toHaveBeenCalled()

      it 'should load accountApplication if forComparison opt is passed', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        stubAngularAjaxRequest httpBackend, requestURL, fakeSalesforceApplication
        ShortFormApplicationService.getMyApplicationForListing 'xyz', {forComparison: true}
        httpBackend.flush()
        expect(fakeDataService.reformatApplication).toHaveBeenCalled()
        expect(ShortFormApplicationService.accountApplication.id).toEqual(fakeShortForm.id)

    describe 'keepCurrentDraftApplication', ->
      beforeEach ->
        setupFakeApplicant()
        ShortFormApplicationService.application = fakeShortForm
        ShortFormApplicationService.accountApplication = fakeShortForm
        ShortFormApplicationService.accountApplication.id = '99'
      afterEach ->
        resetFakePeople()

      it 'should inherit id from accountApplication', ->
        ShortFormApplicationService.keepCurrentDraftApplication(fakeApplicant)
        expect(ShortFormApplicationService.application.id).toEqual('99')
      it 'should importUserData into current application', ->
        ShortFormApplicationService.keepCurrentDraftApplication(fakeApplicant)
        expect(ShortFormApplicationService.applicant.firstName).toEqual(fakeApplicant.firstName)

    describe 'importUserData', ->
      describe 'account name differs from application name', ->
        it 'replaces primary applicant preferences with account name', ->
          loggedInUser =
            firstName: 'Jane'
            lastName: 'Doe'
          ShortFormApplicationService.applicant =
            firstName: 'Janice'
            lastName: 'Jane'
          ShortFormApplicationService.application.preferences =
            liveInSf_household_member: 1
          ShortFormApplicationService.importUserData(loggedInUser)
          expect(ShortFormApplicationService.application.preferences.liveInSf_household_member)
            .toEqual(1)

    describe 'afterGeocode', ->
      beforeEach ->
        setupFakeApplicant()
        ShortFormApplicationService.applicant = fakeApplicant
        setupFakeHouseholdMember()
        ShortFormApplicationService.householdMember = fakeHouseholdMember
      afterEach ->
        resetFakePeople()

      callback = ->
      member = null

      _.each(['applicant', 'householdMember'], (memberType) ->
        isPrimary = memberType == 'applicant'

        describe "when the #{memberType} is indicated", ->
          beforeEach ->
            member = ShortFormApplicationService[memberType]

          describe 'when the given response is empty', ->
            it "sets the #{memberType}'s geocodingData to null", ->
              ShortFormApplicationService.afterGeocode(isPrimary, callback, {})
              expect(member.geocodingData).toEqual null

            it "sets the #{memberType}'s preferenceAddressMatch to null", ->
              ShortFormApplicationService.afterGeocode(isPrimary, callback, {})
              expect(member.preferenceAddressMatch).toEqual null

          describe 'when the given response has data', ->
            it "sets the #{memberType}'s geocodingData to the response GIS data", ->
              response = {gis_data: {foo: 'bar'}}
              ShortFormApplicationService.afterGeocode(isPrimary, callback, response)
              expect(member.geocodingData).toEqual response.gis_data

            it "sets the #{memberType}'s preferenceAddressMatch to the right string value", ->
              response = {gis_data: boundary_match: true}
              ShortFormApplicationService.afterGeocode(isPrimary, callback, response)
              expect(member.preferenceAddressMatch).toEqual 'Matched'

              response = {gis_data: boundary_match: false}
              ShortFormApplicationService.afterGeocode(isPrimary, callback, response)
              expect(member.preferenceAddressMatch).toEqual 'Not Matched'

              response = {gis_data: boundary_match: null}
              ShortFormApplicationService.afterGeocode(isPrimary, callback, response)
              expect(member.preferenceAddressMatch).toEqual ''

          it "calls Service.clearAddressRelatedProofForMember with the #{memberType}", ->
            spyOn(ShortFormApplicationService, 'clearAddressRelatedProofForMember')
            ShortFormApplicationService.afterGeocode(isPrimary, callback, {})
            expect(ShortFormApplicationService.clearAddressRelatedProofForMember).toHaveBeenCalledWith(member)

          if isPrimary
            it 'calls Service.copyNeighborhoodMatchToHousehold', ->
              spyOn(ShortFormApplicationService, 'copyNeighborhoodMatchToHousehold')
              ShortFormApplicationService.afterGeocode(isPrimary, callback, {})
              expect(ShortFormApplicationService.copyNeighborhoodMatchToHousehold).toHaveBeenCalled()
          else
            it 'calls Service.addHouseholdMember with the householdMember', ->
              spyOn(ShortFormApplicationService, 'addHouseholdMember')
              ShortFormApplicationService.afterGeocode(isPrimary, callback, {})
              expect(ShortFormApplicationService.addHouseholdMember).toHaveBeenCalledWith(member)
      )

      it 'calls Service.refreshPreferences with "all"', ->
        spyOn(ShortFormApplicationService, 'refreshPreferences')
        ShortFormApplicationService.afterGeocode(false, callback, {})
        expect(ShortFormApplicationService.refreshPreferences).toHaveBeenCalledWith('all')

      it 'calls the given callback function', ->
        callback = jasmine.createSpy()
        ShortFormApplicationService.afterGeocode(true, callback, {})
        expect(callback).toHaveBeenCalled()

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

    describe 'cancelPreference', ->
      it 'unsets preference fields', ->
        spyOn(ShortFormApplicationService, 'unsetPreferenceFields').and.callThrough()

        preference = 'certOfPreference'
        ShortFormApplicationService.cancelPreference(preference)
        expect(ShortFormApplicationService.unsetPreferenceFields)
          .toHaveBeenCalledWith(preference)

      describe 'cancels Live/Work', ->
        it 'should clear Live/Work combo options if Live/Work is canceled', ->
          ShortFormApplicationService.preferences.liveWorkInSf = true
          ShortFormApplicationService.preferences.liveWorkInSf_preference = 'liveInSf'

          ShortFormApplicationService.cancelPreference('liveWorkInSf')
          expect(ShortFormApplicationService.preferences.liveWorkInSf).toEqual false
          expect(ShortFormApplicationService.preferences.liveWorkInSf_preference)
            .toEqual null

        it 'should clear Live/Work combo options if Live is canceled', ->
          ShortFormApplicationService.preferences.liveWorkInSf = true
          ShortFormApplicationService.preferences.liveWorkInSf_preference = 'liveInSf'

          ShortFormApplicationService.cancelPreference('liveInSf')
          expect(ShortFormApplicationService.preferences.liveWorkInSf).toEqual false
          expect(ShortFormApplicationService.preferences.liveWorkInSf_preference)
            .toEqual null

        it 'should clear Live/Work combo options if Work is canceled', ->
          ShortFormApplicationService.preferences.liveWorkInSf = true
          ShortFormApplicationService.preferences.liveWorkInSf_preference = 'liveInSf'

          ShortFormApplicationService.cancelPreference('workInSf')
          expect(ShortFormApplicationService.preferences.liveWorkInSf).toEqual false
          expect(ShortFormApplicationService.preferences.liveWorkInSf_preference)
            .toEqual null

        it 'should unset individual Live and Work fields if Live/Work is canceled', ->
          spyOn(ShortFormApplicationService, 'unsetPreferenceFields').and.callThrough()

          ShortFormApplicationService.cancelPreference('liveWorkInSf')
          expect(ShortFormApplicationService.unsetPreferenceFields)
            .toHaveBeenCalledWith('liveInSf')
          expect(ShortFormApplicationService.unsetPreferenceFields)
            .toHaveBeenCalledWith('workInSf')

      describe 'cancels NRHP', ->
        beforeEach ->
          spyOn(ShortFormApplicationService, 'cancelPreference').and.callThrough()

        it 'should not clear Live in SF if listing doesn\'t have NRHP', ->
          # Listing doesn't have NRHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(false)

          ShortFormApplicationService.cancelPreference('neighborhoodResidence')
          expect(ShortFormApplicationService.cancelPreference).not.toHaveBeenCalledWith('liveInSf')

        it 'should not clear Live in SF if applicant not eligible for NRHP', ->
          # Listing has NRHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

          # Applicant not eligible for NRHP
          setupFakeApplicant({ preferenceAddressMatch: 'Not Matched' })
          ShortFormApplicationService.applicant = fakeApplicant

          ShortFormApplicationService.cancelPreference('neighborhoodResidence')
          expect(ShortFormApplicationService.cancelPreference).not.toHaveBeenCalledWith('liveInSf')

          resetFakePeople()

        it 'should clear Live in SF if listing has NRHP and applicant is elibible for NRHP', ->
          # Listing has NRHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

          # Applicant is eligible for NRHP
          setupFakeApplicant({ preferenceAddressMatch: 'Matched' })
          ShortFormApplicationService.applicant = fakeApplicant

          ShortFormApplicationService.cancelPreference('neighborhoodResidence')
          expect(ShortFormApplicationService.cancelPreference).toHaveBeenCalledWith('liveInSf')

          resetFakePeople()

      describe 'cancels ADHP', ->
        beforeEach ->
          spyOn(ShortFormApplicationService, 'cancelPreference').and.callThrough()

        it 'should not clear Live in SF if listing doesn\'t have ADHP', ->
          # Listing doesn't have ADHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(false)

          ShortFormApplicationService.cancelPreference('antiDisplacement')
          expect(ShortFormApplicationService.cancelPreference).not.toHaveBeenCalledWith('liveInSf')

        it 'should not clear Live in SF if applicant not eligible for ADHP', ->
          # Listing has ADHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

          # Applicant not eligible for ADHP
          setupFakeApplicant({ preferenceAddressMatch: 'Not Matched' })
          ShortFormApplicationService.applicant = fakeApplicant

          ShortFormApplicationService.cancelPreference('antiDisplacement')
          expect(ShortFormApplicationService.cancelPreference).not.toHaveBeenCalledWith('liveInSf')

          resetFakePeople()

        it 'should clear Live in SF if listing has ADHP and applicant is elibible for ADHP', ->
          # Listing has ADHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

          # Applicant is eligible for ADHP
          setupFakeApplicant({ preferenceAddressMatch: 'Matched' })
          ShortFormApplicationService.applicant = fakeApplicant

          ShortFormApplicationService.cancelPreference('antiDisplacement')
          expect(ShortFormApplicationService.cancelPreference).toHaveBeenCalledWith('liveInSf')

          resetFakePeople()

    describe 'unsetPreferenceFields', ->
      it 'should clear preference name, household member, proof option, and file', ->
        fakeFileUploadService.deleteFile = jasmine.createSpy()
        ShortFormApplicationService.preferences.liveInSf = true
        ShortFormApplicationService.preferences.liveInSf_household_member = 1
        ShortFormApplicationService.preferences.liveInSf_proofOption = 'Telephone bill'
        ShortFormApplicationService.preferences.documents.liveInSf = {
          proofOption: 'Telephone Bill'
          file: {name: 'somefile.pdf'}
        }

        ShortFormApplicationService.unsetPreferenceFields('liveInSf')
        expect(ShortFormApplicationService.preferences.liveInSf).toEqual null
        expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual null
        expect(ShortFormApplicationService.preferences.liveInSf_proofOption).toEqual null
        expect(fakeFileUploadService.deleteFile)
          .toHaveBeenCalledWith(ShortFormApplicationService.listing, {prefType: 'liveInSf'})

      it 'should delete Rent Burdened preference files', ->
        listingId = ShortFormApplicationService.listing.Id

        ShortFormApplicationService.unsetPreferenceFields('rentBurden')
        expect(fakeRentBurdenFileService.deleteRentBurdenPreferenceFiles)
          .toHaveBeenCalledWith(listingId)

      it 'should clear COP certificate number', ->
        ShortFormApplicationService.preferences.certOfPreference_certificateNumber =
          '12345678'

        ShortFormApplicationService.unsetPreferenceFields('certOfPreference')
        expect(ShortFormApplicationService.preferences.certOfPreference_certificateNumber)
          .toEqual null

      it 'should clear DTHP certificate number', ->
        ShortFormApplicationService.preferences.displaced_certificateNumber =
          '12345678'

        ShortFormApplicationService.unsetPreferenceFields('displaced')
        expect(ShortFormApplicationService.preferences.displaced_certificateNumber)
          .toEqual null

      it 'should clear preference address fields', ->
        ShortFormApplicationService.preferences.aliceGriffith_address =
          {
            address1: '1234 Main St'
            address2: 'Apt 3'
            city: 'San Francisco'
            state: 'CA'
            zip: '94114'
          }

        ShortFormApplicationService.unsetPreferenceFields('aliceGriffith')
        expect(ShortFormApplicationService.preferences.aliceGriffith_address)
          .toEqual null

    describe 'cancelOptOut', ->
      it 'should clear preference opt out', ->
        ShortFormApplicationService.preferences.optOut.liveInSf = true

        ShortFormApplicationService.cancelOptOut('liveInSf')
        expect(ShortFormApplicationService.preferences.optOut.liveInSf).toEqual false

      describe 'cancel NRHP Opt Out', ->
        beforeEach ->
          spyOn(ShortFormApplicationService, 'cancelOptOut').and.callThrough()

        it 'should not clear Live/Work Opt Out if listing doesn\'t have NRHP', ->
          # Listing doesn't have NRHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(false)

          ShortFormApplicationService.cancelOptOut('neighborhoodResidence')
          expect(ShortFormApplicationService.cancelOptOut)
            .not.toHaveBeenCalledWith('liveWorkInSf')

        it 'should not clear Live/Work Opt Out if applicant not eligible for NRHP', ->
          # Listing has NRHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

          # Applicant not eligible for NRHP
          setupFakeApplicant({ preferenceAddressMatch: 'Not Matched' })
          ShortFormApplicationService.applicant = fakeApplicant

          ShortFormApplicationService.cancelOptOut('neighborhoodResidence')
          expect(ShortFormApplicationService.cancelOptOut)
            .not.toHaveBeenCalledWith('liveWorkInSf')

          resetFakePeople()

        it 'should clear Live/Work Opt Out if listing has NRHP and elibible for NRHP', ->
          # Listing has NRHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

          # Applicant is eligible for NRHP
          setupFakeApplicant({ preferenceAddressMatch: 'Matched' })
          ShortFormApplicationService.applicant = fakeApplicant

          ShortFormApplicationService.cancelOptOut('neighborhoodResidence')
          expect(ShortFormApplicationService.cancelOptOut).toHaveBeenCalledWith('liveWorkInSf')

          resetFakePeople()

      describe 'cancel ADHP Opt Out', ->
        beforeEach ->
          spyOn(ShortFormApplicationService, 'cancelOptOut').and.callThrough()

        it 'should not clear Live/Work Opt Out if listing doesn\'t have ADHP', ->
          # Listing doesn't have ADHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(false)

          ShortFormApplicationService.cancelOptOut('antiDisplacement')
          expect(ShortFormApplicationService.cancelOptOut).not.toHaveBeenCalledWith('liveWorkInSf')

        it 'should not clear Live/Work Opt Out if not eligible for ADHP', ->
          # Listing has ADHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

          # Applicant not eligible for ADHP
          setupFakeApplicant({ preferenceAddressMatch: 'Not Matched' })
          ShortFormApplicationService.applicant = fakeApplicant

          ShortFormApplicationService.cancelOptOut('antiDisplacement')
          expect(ShortFormApplicationService.cancelOptOut).not.toHaveBeenCalledWith('liveWorkInSf')

          resetFakePeople()

        it 'should clear Live/Work Opt Out if listing has ADHP and elibible for ADHP', ->
          # Listing has ADHP
          fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)

          # Applicant is eligible for ADHP
          setupFakeApplicant({ preferenceAddressMatch: 'Matched' })
          ShortFormApplicationService.applicant = fakeApplicant

          ShortFormApplicationService.cancelOptOut('antiDisplacement')
          expect(ShortFormApplicationService.cancelOptOut).toHaveBeenCalledWith('liveWorkInSf')

          resetFakePeople()

    describe 'resetPreference', ->
      beforeEach ->
        ShortFormApplicationService.preferences.liveInSf = true
        ShortFormApplicationService.preferences.liveInSf_household_member = 'Jane Doe'
        ShortFormApplicationService.preferences.optOut = { liveInSf: true }
        ShortFormApplicationService.application.validatedForms.Preferences['live-work-preference'] = false

      it 'should clear preference options and validatedForms', ->
        ShortFormApplicationService.resetPreference('liveInSf')
        expect(ShortFormApplicationService.preferences.liveInSf).toEqual null
        expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual null
        expect(ShortFormApplicationService.application.validatedForms.Preferences).toEqual {}
        expect(ShortFormApplicationService.application.preferences.optOut.liveInSf).toEqual false

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

    describe 'hasHouseholdPublicHousingQuestion', ->
      it 'should includes public housing question when listing has Rent Burdened / Assisted Housing Preference', ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(true)
        showHouseholdPublicHousingQuestion = ShortFormApplicationService.hasHouseholdPublicHousingQuestion()
        expect(fakeListingPreferenceService.hasPreference).toHaveBeenCalledWith('assistedHousing', fakeListing)
        expect(showHouseholdPublicHousingQuestion).toEqual true

      it 'should NOT include public housing question when listing doesn\'t have Rent Burdened / Assisted Housing Preference', ->
        fakeListingPreferenceService.hasPreference = jasmine.createSpy().and.returnValue(false)
        showHouseholdPublicHousingQuestion = ShortFormApplicationService.hasHouseholdPublicHousingQuestion()
        expect(fakeListingPreferenceService.hasPreference).toHaveBeenCalledWith('assistedHousing', fakeListing)
        expect(showHouseholdPublicHousingQuestion).toEqual false

    describe 'loadApplication', ->
      it 'reformats the application', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadApplication(data)
        expect(fakeDataService.reformatApplication)
          .toHaveBeenCalledWith(data.application, [])

      it 'loads the listing into Service.listing for viewing submitted applications', ->
        spyOn(fakeListingDataService, 'loadListing').and.callThrough()
        data =
          application: fakeShortForm
        data.application.status = 'Submitted'
        data.application.listing = {Id: 'XYZ'}
        ShortFormApplicationService.loadApplication(data)
        expect(fakeListingDataService.loadListing)
          .toHaveBeenCalledWith(data.application.listing)

      it 'resets user data', ->
        spyOn(ShortFormApplicationService, 'resetApplicationData').and.callThrough()
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadApplication(data)
        expect(ShortFormApplicationService.resetApplicationData).toHaveBeenCalled()

    describe 'loadAccountApplication', ->
      beforeEach ->
        spyOn(fakeDataService, 'reformatApplication').and.returnValue({application: 'someapp'})

      it 'reformats the application', ->
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadAccountApplication(data)
        expect(fakeDataService.reformatApplication)
          .toHaveBeenCalledWith(data.application)

      it 'assigns accountApplication to formatted app', ->
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadAccountApplication(data)
        expect(ShortFormApplicationService.accountApplication)
          .toEqual({application: 'someapp'})

    describe 'applicationWasSubmitted', ->
      beforeEach ->
        ShortFormApplicationService.application = fakeShortForm

      it 'should not indicate app was submitted for "Draft"', ->
        ShortFormApplicationService.application.status = 'Draft'
        expect(ShortFormApplicationService.applicationWasSubmitted()).toEqual(false)

      it 'should indicate app was submitted for "Submitted"', ->
        ShortFormApplicationService.application.status = 'Submitted'
        expect(ShortFormApplicationService.applicationWasSubmitted()).toEqual(true)

      it 'should indicate app was submitted for "Removed"', ->
        ShortFormApplicationService.application.status = 'Removed'
        expect(ShortFormApplicationService.applicationWasSubmitted()).toEqual(true)

    describe 'invalidateCurrentSectionIfIncomplete', ->
      beforeEach ->
        ShortFormApplicationService.activeSection = { name: 'You' }

      it 'should set section as incomplete if it has an invalid form', ->
        ShortFormApplicationService.form.applicationForm =
          $invalid: true
          $valid: false
        ShortFormApplicationService.application.completedSections['You'] = true
        ShortFormApplicationService.invalidateCurrentSectionIfIncomplete()
        expect(ShortFormApplicationService.application.completedSections['You']).toEqual(false)

      it 'should not mark section as incomplete if it has a valid form', ->
        ShortFormApplicationService.form.applicationForm =
          $invalid: false
          $valid: true
        ShortFormApplicationService.application.completedSections['You'] = true
        ShortFormApplicationService.invalidateCurrentSectionIfIncomplete()
        expect(ShortFormApplicationService.application.completedSections['You']).toEqual(true)

    describe 'hasCompleteRentBurdenFilesForAddress', ->
      it 'returns true with lease and rent file', ->
        ShortFormApplicationService.application.preferences =
          documents:
            rentBurden:
              '123 Main St':
                lease: {file: 'some file'}
                rent:
                  1: {file: 'some file'}
        expect(ShortFormApplicationService.hasCompleteRentBurdenFilesForAddress('123 Main St')).toEqual true

      it 'returns false with missing file', ->
        ShortFormApplicationService.application.preferences.documents.rentBurden =
          '123 Main St':
            lease: {file: 'some file'}
        expect(ShortFormApplicationService.hasCompleteRentBurdenFilesForAddress('123 Main St')).toEqual false

    describe 'hasCompleteRentBurdenFiles', ->
      beforeEach ->
        ShortFormApplicationService.application.groupedHouseholdAddresses = [{"address": "123 Main St"}]
      it 'returns true with lease and rent file', ->
        ShortFormApplicationService.application.preferences =
          documents:
            rentBurden:
              '123 Main St':
                lease: {file: 'some file'}
                rent:
                  1: {file: 'some file'}
        expect(ShortFormApplicationService.hasCompleteRentBurdenFiles()).toEqual true

      it 'returns false with missing file', ->
        ShortFormApplicationService.application.preferences.documents.rentBurden =
          '123 Main St':
            lease: {file: 'some file'}
        expect(ShortFormApplicationService.hasCompleteRentBurdenFiles()).toEqual false

    describe 'claimedCustomPreference', ->
      beforeEach ->
        fakeListing = getJSONFixture('listings-api-show.json').listing
        ShortFormApplicationService.listing = fakeListing
        fakeCustomPreference =
          listingPreferenceID: '123456'
        ShortFormApplicationService.listing.customPreferences = [fakeCustomPreference]

      it 'returns true if custom preferences were claimed', ->
        ShortFormApplicationService.preferences = {'123456': true}
        expect(ShortFormApplicationService.claimedCustomPreference(fakeCustomPreference)).toEqual true

      it 'returns false if custom preferences were not claimed', ->
        ShortFormApplicationService.preferences = {'liveInSf': true}
        expect(ShortFormApplicationService.claimedCustomPreference(fakeCustomPreference)).toEqual false

    # multilingual
    describe 'setApplicationLanguage', ->
      it 'sets application language to the full name version of the lang param', ->
        fakeSharedService.getLanguageName = jasmine.createSpy().and.returnValue('Spanish')
        ShortFormApplicationService.setApplicationLanguage('es')
        expect(ShortFormApplicationService.application.applicationLanguage).toEqual 'Spanish'

    describe 'getLanguageCode', ->
      it 'calls SharedService.getLanguageCode with the application language', ->
        fakeSharedService.getLanguageCode = jasmine.createSpy().and.returnValue('es')
        ShortFormApplicationService.getLanguageCode({applicationLanguage: 'Spanish'})
        expect(fakeSharedService.getLanguageCode).toHaveBeenCalledWith('Spanish')

    describe 'switchingLanguage', ->
      it 'returns true if user is switching language', ->
        fakeSharedService.getLanguageCode = jasmine.createSpy().and.returnValue('en')
        ShortFormApplicationService.application.applicationLanguage = 'English'
        $state.params.lang = 'es'
        expect(ShortFormApplicationService.switchingLanguage()).toEqual true

      it 'returns false if user is not switching language', ->
        fakeSharedService.getLanguageCode = jasmine.createSpy().and.returnValue('es')
        ShortFormApplicationService.application.applicationLanguage = 'Spanish'
        $state.params.lang = 'es'
        expect(ShortFormApplicationService.switchingLanguage()).toEqual false

    describe 'sendToLastPageofApp', ->
      describe 'entering short form section that is not the last page of application', ->
        it 'sends user to last page of application', ->
          spyOn($state, 'href').and.returnValue(true)
          ShortFormApplicationService.application.lastPage = 'review-terms'
          ShortFormApplicationService.sendToLastPageofApp('dahlia.short-form-application.name')
          lastPageRoute = 'dahlia.short-form-application.review-terms'
          expect($state.go).toHaveBeenCalledWith(lastPageRoute)

    describe 'checkFormState', ->
      beforeEach ->
        ShortFormApplicationService.form.applicationForm =
          $valid: true

      describe 'when Service.application.validatedForms is empty', ->
        beforeEach ->
          deleteValidatedForms()
        afterEach ->
          resetValidatedForms()

        it 'returns false', ->
          expect(ShortFormApplicationService.checkFormState('dahlia.short-form-application.income')).toEqual false

    describe 'applicationCompletionPercentage', ->
      it 'calculates a baseline percentage of 5% for new applications', ->
        pct = ShortFormApplicationService.applicationCompletionPercentage(ShortFormApplicationService.application)
        expect(pct).toEqual 5

      it 'calculates a percentage based on completedSections', ->
        ShortFormApplicationService.application.completedSections = {
          You: true # 30%
          Household: true # 25%
        }
        pct = ShortFormApplicationService.applicationCompletionPercentage(ShortFormApplicationService.application)
        expect(pct).toEqual 60

    describe 'memberAgeOnForm', ->
      it 'calls Service.memberDOBMoment with the given member string', ->
        spyOn(ShortFormApplicationService, 'memberDOBMoment')
        member = 'householdMember'
        ShortFormApplicationService.memberAgeOnForm(member)
        expect(ShortFormApplicationService.memberDOBMoment).toHaveBeenCalledWith(member)

      it 'returns undefined if Service.memberDOBMoment returns a falsey value', ->
        spyOn(ShortFormApplicationService, 'memberDOBMoment').and.returnValue(null)
        age = ShortFormApplicationService.memberAgeOnForm()
        expect(age).toBeUndefined()

      it 'returns an integer representing the age of the member based on the DOB value returned by Service.memberDOBMoment', ->
        dob = moment('01/01/1990', 'DD/MM/YYYY')
        today = moment()
        yearsDiffTodayAndDOB = today.diff(dob, 'years')

        spyOn(ShortFormApplicationService, 'memberDOBMoment').and.returnValue(dob)
        age = ShortFormApplicationService.memberAgeOnForm()

        expect(age).toBe(yearsDiffTodayAndDOB)

    describe 'memberDOBMoment', ->
      beforeEach ->
        ShortFormApplicationService.form.applicationForm =
          date_of_birth_year:
            $viewValue: '1990'

      it 'calls Service.DOBValues with the given member string', ->
        member = 'householdMember'
        spyOn(ShortFormApplicationService, 'DOBValues').and.returnValue({})
        ShortFormApplicationService.memberDOBMoment(member)
        expect(ShortFormApplicationService.DOBValues).toHaveBeenCalledWith(member)

      it 'returns false if Service.DOBValues does not return a month value', ->
        spyOn(ShortFormApplicationService, 'DOBValues').and.returnValue({day: 1})
        result = ShortFormApplicationService.memberDOBMoment()
        expect(result).toBe(false)

      it 'returns false if Service.DOBValues does not return a day value', ->
        spyOn(ShortFormApplicationService, 'DOBValues').and.returnValue({month: 1})
        result = ShortFormApplicationService.memberDOBMoment()
        expect(result).toBe(false)

      it 'returns false if the birth year in the short form is < 1900', ->
        ShortFormApplicationService.form.applicationForm =
          date_of_birth_year:
            $viewValue: '01/01/1899'
        result = ShortFormApplicationService.memberDOBMoment()
        expect(result).toBe(false)

      describe 'if Service.DOBValues returns a month and a day, and the birth year in the short form is >= 1900', ->
        it 'returns a moment object representing the member DOB, constructed using the month and
            day returned by Service.DOBValues and the year from the short form', ->
          year = ShortFormApplicationService.form.applicationForm.date_of_birth_year.$viewValue
          values = {month: 1, day: 1}
          dobMoment = moment("#{year}-#{values.month}-#{values.day}", 'YYYY-MM-DD')

          spyOn(ShortFormApplicationService, 'DOBValues').and.returnValue(values)
          result = ShortFormApplicationService.memberDOBMoment()

          expect(result).toEqual(dobMoment)
