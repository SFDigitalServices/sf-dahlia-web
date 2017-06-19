do ->
  'use strict'
  describe 'ShortFormApplicationService', ->
    ShortFormApplicationService = undefined
    httpBackend = undefined
    fakeListing = undefined
    fakeShortForm = getJSONFixture('sample-web-short-form.json')
    fakeSalesforceApplication = {application: getJSONFixture('sample-salesforce-short-form.json')}
    validateHouseholdMatch = getJSONFixture('short_form-api-validate_household-match.json')
    $translate = {}
    $state =
      go: jasmine.createSpy()
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
    fakeListingService =
      listing:
        Id: ''
      hasPreference: ->
    fakeDataService =
      formatApplication: -> fakeShortForm
      reformatApplication: -> fakeShortForm
      formatUserDOB: ->
      initRentBurdenDocs: jasmine.createSpy()
    fakeAnalyticsService =
      trackFormSuccess: jasmine.createSpy()
      trackFormError: jasmine.createSpy()
      trackFormAbandon: jasmine.createSpy()
    fakeFileUploadService =
      uploadProof: jasmine.createSpy()
      deletePreferenceFile: jasmine.createSpy()
      deleteRentBurdenPreferenceFiles: jasmine.createSpy()
    uuid = {v4: jasmine.createSpy()}
    requestURL = undefined
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

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value '$state', $state
      $provide.value '$translate', $translate
      $provide.value 'uuid', uuid
      $provide.value 'ListingService', fakeListingService
      $provide.value 'ShortFormDataService', fakeDataService
      $provide.value 'AnalyticsService', fakeAnalyticsService
      $provide.value 'FileUploadService', fakeFileUploadService
      return
    )

    beforeEach inject((_$httpBackend_, _ShortFormApplicationService_) ->
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
        setupFakeApplicant({neighborhoodPreferenceMatch: 'Matched'})
        ShortFormApplicationService.applicant = fakeApplicant
        setupFakeHouseholdMember(
          hasSameAddressAsApplicant: 'Yes'
          neighborhoodPreferenceMatch: null
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
          expect(householdMember.id).toEqual(1)

        it 'adds household member to Service.householdMembers', ->
          expect(ShortFormApplicationService.householdMembers.length).toEqual 1
          expect(ShortFormApplicationService.householdMembers[0]).toEqual fakeHouseholdMember

        it 'copies neighborhoodPreferenceMatch from applicant if hasSameAddressAsApplicant', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.neighborhoodPreferenceMatch).toEqual(ShortFormApplicationService.applicant.neighborhoodPreferenceMatch)

      describe 'old household member update', ->
        it 'copies neighborhoodPreferenceMatch from applicant if hasSameAddressAsApplicant', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
          householdMember.hasSameAddressAsApplicant = 'Yes'
          ShortFormApplicationService.addHouseholdMember(householdMember)
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.neighborhoodPreferenceMatch).toEqual(ShortFormApplicationService.applicant.neighborhoodPreferenceMatch)

        it 'does not copy neighborhoodPreferenceMatch from applicant if hasSameAddressAsApplicant == "No"', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
          householdMember.neighborhoodPreferenceMatch = 'Not Matched'
          householdMember.hasSameAddressAsApplicant = 'No'
          ShortFormApplicationService.addHouseholdMember(householdMember)
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          expect(householdMember.neighborhoodPreferenceMatch).not.toEqual(ShortFormApplicationService.applicant.neighborhoodPreferenceMatch)

        it 'does not add a new household member', ->
          householdMember = ShortFormApplicationService.getHouseholdMember(fakeHouseholdMember.id)
          householdMember = angular.copy(householdMember)
          ShortFormApplicationService.addHouseholdMember(householdMember)
          expect(ShortFormApplicationService.householdMembers.length).toEqual(1)

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
        setupFakeApplicant({ firstName: 'Frank', lastName: 'Robinson' })
        ShortFormApplicationService.applicant = fakeApplicant
        # reset the spy so that we can check for "not" toHaveBeenCalled
        fakeFileUploadService.deletePreferenceFile = jasmine.createSpy()
      afterEach ->
        resetFakePeople()

      it 'clears the proof file for a preference if the indicated member is selected', ->
        ShortFormApplicationService.preferences.liveInSf_household_member = 'Frank Robinson'
        ShortFormApplicationService.clearAddressRelatedProofForMember(ShortFormApplicationService.applicant)
        expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual 'Frank Robinson'
        expect(fakeFileUploadService.deletePreferenceFile).toHaveBeenCalledWith('liveInSf', ShortFormApplicationService.listing.Id)

      it 'does not clear the proof file for a preference if the indicated member is not selected', ->
        ShortFormApplicationService.preferences.liveInSf_household_member = 'Joseph Mann'
        ShortFormApplicationService.clearAddressRelatedProofForMember(ShortFormApplicationService.applicant)
        expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual 'Joseph Mann'
        expect(fakeFileUploadService.deletePreferenceFile).not.toHaveBeenCalled()


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
            fakeFileUploadService.deletePreferenceFile = jasmine.createSpy()
            ShortFormApplicationService.householdMembers = []
            ShortFormApplicationService.applicant = fakeApplicant
            ShortFormApplicationService.application.completedSections['Preferences'] = true
            ShortFormApplicationService.preferences =
              liveInSf: true
              liveInSf_household_member: fakeApplicant.firstName + " " + fakeApplicant.lastName
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
            expect(fakeFileUploadService.deletePreferenceFile).toHaveBeenCalledWith('liveInSf', ShortFormApplicationService.listing.Id)

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
          ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Not Matched'

        it 'returns array without applicant', ->
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers().length).toEqual(0)

      describe 'applicant matches neighborhood preference', ->
        beforeEach ->
          ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'

        it 'returns array with applicant', ->
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers().length).toEqual(1)
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers()[0]).toEqual(fakeApplicant)

      describe 'household member matches neighborhood preference', ->
        beforeEach ->
          fakeHouseholdMember.neighborhoodPreferenceMatch = 'Matched'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

        it 'returns array with household member', ->
          members = ShortFormApplicationService.liveInTheNeighborhoodMembers()
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers().length).toEqual(1)
          expect(ShortFormApplicationService.liveInTheNeighborhoodMembers()[0]).toEqual(fakeHouseholdMember)

      describe 'applicant and household member match neighborhood preference', ->
        beforeEach ->
          ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
          fakeHouseholdMember.neighborhoodPreferenceMatch = 'Matched'
          ShortFormApplicationService.addHouseholdMember(fakeHouseholdMember)

        it 'returns array with applicant and household member', ->
          liveInTheNeighborhoodMembers = ShortFormApplicationService.liveInTheNeighborhoodMembers()
          expect(liveInTheNeighborhoodMembers.length).toEqual(2)
          expect(_.find(liveInTheNeighborhoodMembers, {firstName: fakeApplicant.firstName})).toEqual(fakeApplicant)
          expect(_.find(liveInTheNeighborhoodMembers, {firstName: fakeHouseholdMember.firstName})).toEqual(fakeHouseholdMember)

    describe 'eligibleForLiveWork', ->
      beforeEach ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(true)

      it 'returns true if someone is eligible for live/work', ->
        ShortFormApplicationService.applicant.workInSf = 'Yes'
        expect(ShortFormApplicationService.eligibleForLiveWork()).toEqual true

      it 'returns false if nobody is eligible for live/work', ->
        ShortFormApplicationService.applicant.workInSf = 'No'
        expect(ShortFormApplicationService.eligibleForLiveWork()).toEqual false

      it 'returns false if listing does not have liveWorkInSf', ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(false)
        ShortFormApplicationService.applicant.workInSf = 'Yes'
        expect(ShortFormApplicationService.eligibleForLiveWork()).toEqual false

    describe 'eligibleForNRHP', ->
      beforeEach ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(true)

      it 'returns true if someone is eligible for NRHP', ->
        ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
        expect(ShortFormApplicationService.eligibleForNRHP()).toEqual true

      it 'returns false if nobody is eligible for NRHP', ->
        ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Not Matched'
        expect(ShortFormApplicationService.eligibleForNRHP()).toEqual false

      it 'returns false if listing does not have NRHP', ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(false)
        ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
        expect(ShortFormApplicationService.eligibleForNRHP()).toEqual false

    describe 'eligibleForADHP', ->
      beforeEach ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(true)

      it 'returns true if someone is eligible for ADHP', ->
        ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
        expect(ShortFormApplicationService.eligibleForADHP()).toEqual true

      it 'returns false if nobody is eligible for ADHP', ->
        ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Not Matched'
        expect(ShortFormApplicationService.eligibleForADHP()).toEqual false

      it 'returns false if listing does not have ADHP', ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(false)
        ShortFormApplicationService.applicant.neighborhoodPreferenceMatch = 'Matched'
        expect(ShortFormApplicationService.eligibleForADHP()).toEqual false

    describe 'eligibleForAssistedHousing', ->
      it 'returns true if application said yes to public housing', ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(true)
        # TO DO: update during API integration story for preference
        ShortFormApplicationService.application.hasPublicHousing = 'Yes'
        expect(ShortFormApplicationService.eligibleForAssistedHousing()).toEqual true

      it 'returns false if application does not have assistedHousing', ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(true)
        # TO DO: update during API integration story for preference
        ShortFormApplicationService.application.hasPublicHousing = 'No'
        expect(ShortFormApplicationService.eligibleForAssistedHousing()).toEqual false

    describe 'eligibleForRentBurden', ->
      beforeEach ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(true)
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
          fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(false)
          ShortFormApplicationService.application.householdIncome.incomeTotal = 3000
          expect(ShortFormApplicationService.eligibleForRentBurden()).toEqual false

    describe 'copyNeighborhoodToLiveInSf', ->
      beforeEach ->
        ShortFormApplicationService.preferences.neighborhoodResidence = true
        ShortFormApplicationService.preferences.neighborhoodResidence_household_member = 'Jane Doe'
        ShortFormApplicationService.preferences.documents.neighborhoodResidence = {
          proofOption: 'Gas Bill'
          file: {}
        }

      it 'copies Neighborhood member to liveInSf', ->
        ShortFormApplicationService.copyNeighborhoodToLiveInSf('neighborhoodResidence')
        expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual 'Jane Doe'
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
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(true)
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

    describe 'checkSurveyComplete', ->
      beforeEach ->
        setupFakeApplicant()
      afterEach ->
        resetFakePeople()

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

    describe 'submitApplication', ->
      beforeEach ->
        fakeListing = getJSONFixture('listings-api-show.json').listing
        ShortFormApplicationService.application = fakeShortForm

      it 'should indicate app status as submitted', ->
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        expect(ShortFormApplicationService.application.status).toEqual('submitted')

      it 'should call formatApplication on ShortFormDataService', ->
        spyOn(fakeDataService, 'formatApplication').and.callThrough()
        ShortFormApplicationService.submitApplication(fakeListing.id, fakeShortForm)
        expect(fakeDataService.formatApplication).toHaveBeenCalled()

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

    describe 'getMyAccountApplication', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'should load application into accountApplication', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        stubAngularAjaxRequest httpBackend, requestURL, fakeSalesforceApplication
        ShortFormApplicationService.getMyAccountApplication()
        httpBackend.flush()
        expect(fakeDataService.reformatApplication).toHaveBeenCalledWith(fakeSalesforceApplication.application)

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
            liveInSf_household_member: 'Janice Jane'
          ShortFormApplicationService.importUserData(loggedInUser)
          expect(ShortFormApplicationService.application.preferences.liveInSf_household_member)
            .toEqual('Jane Doe')

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
      beforeEach ->
        fakeFileUploadService.deletePreferenceFile = jasmine.createSpy()
        ShortFormApplicationService.preferences.liveInSf = true
        ShortFormApplicationService.preferences.liveInSf_household_member = 'Jane Doe'
        ShortFormApplicationService.preferences.documents.liveInSf = {
          proofOption: 'Telephone Bill'
          file: {name: 'somefile.pdf'}
        }

      it 'should clear preference name, household member, proof option and file', ->
        ShortFormApplicationService.cancelPreference('liveInSf')
        expect(ShortFormApplicationService.preferences.liveInSf).toEqual null
        expect(ShortFormApplicationService.preferences.liveInSf_household_member).toEqual null
        listingId = ShortFormApplicationService.listing.Id
        expect(fakeFileUploadService.deletePreferenceFile).toHaveBeenCalledWith('liveInSf', listingId)

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
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(true)
        showHouseholdPublicHousingQuestion = ShortFormApplicationService.hasHouseholdPublicHousingQuestion()
        expect(fakeListingService.hasPreference).toHaveBeenCalledWith('assistedHousing')
        expect(showHouseholdPublicHousingQuestion).toEqual true

      it 'should NOT include public housing question when listing doesn\'t have Rent Burdened / Assisted Housing Preference', ->
        fakeListingService.hasPreference = jasmine.createSpy().and.returnValue(false)
        showHouseholdPublicHousingQuestion = ShortFormApplicationService.hasHouseholdPublicHousingQuestion()
        expect(fakeListingService.hasPreference).toHaveBeenCalledWith('assistedHousing')
        expect(showHouseholdPublicHousingQuestion).toEqual false

    describe 'loadApplication', ->
      it 'reformats the application', ->
        spyOn(fakeDataService, 'reformatApplication').and.callThrough()
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadApplication(data)
        expect(fakeDataService.reformatApplication)
          .toHaveBeenCalledWith(data.application, [])

      it 'resets user data', ->
        spyOn(ShortFormApplicationService, 'resetUserData').and.callThrough()
        data =
          application: fakeShortForm
        ShortFormApplicationService.loadApplication(data)
        expect(ShortFormApplicationService.resetUserData).toHaveBeenCalled()

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

    describe 'signInSubmitApplication', ->
      beforeEach ->
        ShortFormApplicationService.application = fakeShortForm
        setupFakeApplicant()
      afterEach ->
        resetFakePeople()

      it 'sends you to the already submitted confirmation if you already submitted', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeSalesforceApplication
        ShortFormApplicationService.application.status = 'submitted'
        ShortFormApplicationService.signInSubmitApplication()
        httpBackend.flush()
        stateOpts =
          skipConfirm: true
          alreadySubmittedId: fakeSalesforceApplication.application.id
          doubleSubmit: true
        expect($state.go).toHaveBeenCalledWith('dahlia.my-applications', stateOpts)

      it 'sends you to choose account settings if they were different', ->
        opts =
          type: 'review-sign-in'
          loggedInUser:
            firstName: 'Mister'
            lastName: 'Tester'
          submitCallback: jasmine.createSpy()
        ShortFormApplicationService.application.status = 'draft'
        stubAngularAjaxRequest httpBackend, requestURL, {}
        ShortFormApplicationService.signInSubmitApplication(opts)
        httpBackend.flush()
        expect($state.go).toHaveBeenCalledWith('dahlia.short-form-application.choose-account-settings')

    describe '_signInAndSkipSubmit', ->
      it 'checks if you\'ve already submitted', ->
        fakePrevApplication = { status: 'submitted', id: '123' }
        params = {skipConfirm: true, alreadySubmittedId: fakePrevApplication.id, doubleSubmit: false}
        ShortFormApplicationService._signInAndSkipSubmit(fakePrevApplication)
        expect($state.go).toHaveBeenCalledWith('dahlia.my-applications', params)
      it 'sends you to choose draft', ->
        fakePrevApplication = { status: 'draft' }
        ShortFormApplicationService._signInAndSkipSubmit(fakePrevApplication)
        expect($state.go).toHaveBeenCalledWith('dahlia.short-form-application.choose-draft')

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
