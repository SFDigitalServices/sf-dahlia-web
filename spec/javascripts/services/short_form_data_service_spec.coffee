do ->
  'use strict'
  describe 'ShortFormDataService', ->
    ShortFormDataService = undefined
    formattedApp = undefined
    reformattedApp = undefined
    fakeListingId = 'a0WU000000CkiM3MAJ'
    fakeSalesforceApplication = getJSONFixture('sample-salesforce-short-form.json')
    fakeApplication = getJSONFixture('sample-web-short-form.json')
    fakeApplicant = undefined
    fakeListingService =
      listing:
        preferences: getJSONFixture('listings-api-listing-preferences.json').preferences
      getPreference: jasmine.createSpy()
      getPreferenceById: jasmine.createSpy()
      hasPreference: ->
      listingHasReservedUnitType: ->
      RESERVED_TYPES:
        VETERAN: 'Veteran'
        DISABLED: 'Developmental disabilities'
        SENIOR: 'Senior'
      preferenceMap:
        certOfPreference: "Certificate of Preference (COP)"
        displaced: "Displaced Tenant Housing Preference (DTHP)"
        liveWorkInSf: "Live or Work in San Francisco Preference"
        liveInSf: "Live or Work in San Francisco Preference"
        workInSf: "Live or Work in San Francisco Preference"
        neighborhoodResidence: "Neighborhood Resident Housing Preference (NRHP)"

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value 'ListingService', fakeListingService
      return
    )

    beforeEach inject((_ShortFormDataService_) ->
      ShortFormDataService = _ShortFormDataService_
      return
    )

    describe 'formatApplication', ->
      beforeEach ->
        formattedApp = ShortFormDataService.formatApplication(fakeListingId, fakeApplication)

      it 'attaches given listingID', ->
        expect(formattedApp.listingID).toEqual(fakeListingId)

      it 'renames applicant to primaryApplicant', ->
        expect(formattedApp.primaryApplicant.firstName).toEqual(fakeApplication.applicant.firstName)

      it 'sends stringified JSON for formMetadata', ->
        expect(formattedApp.formMetadata).toContain('"completedSections"')

    describe 'reformatApplication', ->
      beforeEach ->
        reformattedApp = ShortFormDataService.reformatApplication(fakeSalesforceApplication)

      it 'renames primaryApplicant to applicant', ->
        expect(reformattedApp.applicant.firstName).toEqual(fakeSalesforceApplication.primaryApplicant.firstName)

      it 'reformats mailing address', ->
        expect(reformattedApp.applicant.mailing_address.address1).toEqual("4053 18TH ST")

      it 'reformats stringified JSON formMetadata', ->
        expect(reformattedApp.completedSections.Intro).toEqual(true)

    describe 'checkSurveyComplete', ->
      beforeEach ->
        fakeApplicant = angular.copy(fakeApplication.applicant)
        fakeApplicant.gender = 'Fake'
        fakeApplicant.ethnicity = 'Fake'
        fakeApplicant.race = 'Fake'
        fakeApplicant.sexualOrientation = 'Fake'
        fakeApplicant.referral = {FakeAnswer: true}

      it 'should check if survey is complete', ->
        expect(ShortFormDataService.checkSurveyComplete(fakeApplicant)).toEqual true

      it 'should check if survey is incomplete', ->
        fakeApplicant.gender = null
        expect(ShortFormDataService.checkSurveyComplete(fakeApplicant)).toEqual false
        fakeApplicant.gender = 'Fake'
        fakeApplicant.referral = {FakeAnswer: false}
        expect(ShortFormDataService.checkSurveyComplete(fakeApplicant)).toEqual false

      it 'should check if only demographics are complete, if skipReferral is true', ->
        fakeApplicant.referral = {FakeAnswer: false}
        expect(ShortFormDataService.checkSurveyComplete(fakeApplicant, {skipReferral: true})).toEqual true

    describe 'maxDOBDay', ->
      it 'gives max of 30 for appropriate months', ->
        expect(ShortFormDataService.maxDOBDay(4, 2001)).toEqual(30)

      it 'gives max of 31 for appropriate months', ->
        expect(ShortFormDataService.maxDOBDay(5, 2001)).toEqual(31)

      it 'gives max of 29 for leap year', ->
        expect(ShortFormDataService.maxDOBDay(2, 2000)).toEqual(29)

    describe '_autofillReset', ->
      it 'should check if demographic survey was completed', ->
        fakeApplication.surveyComplete = null
        fakeApplication.applicant.gender = 'X'
        fakeApplication.applicant.ethnicity = 'X'
        fakeApplication.applicant.race = 'X'
        fakeApplication.applicant.sexualOrientation = 'X'
        ShortFormDataService._autofillReset(fakeApplication)
        expect(fakeApplication.surveyComplete).toEqual true

      it 'should reset completed sections', ->
        sections = ['Intro', 'You', 'Household', 'Preferences', 'Income']
        _.each sections, (section) ->
          fakeApplication.completedSections[section] = true
        ShortFormDataService.defaultCompletedSections =
          Intro: false
          You: false
          Household: false
          Preferences: false
          Income: false
        ShortFormDataService._autofillReset(fakeApplication)
        expect(fakeApplication.completedSections['Intro']).toEqual false

      it 'should reset appMemberId and neighborhoodPreferenceMatch fields', ->
        fakeApplication.applicant.appMemberId = '123XYZ'
        fakeApplication.applicant.neighborhoodPreferenceMatch = 'Matched'
        ShortFormDataService._autofillReset(fakeApplication)
        expect(fakeApplication.applicant.appMemberId).toBeUndefined()
        expect(fakeApplication.applicant.neighborhoodPreferenceMatch).toBeUndefined()

      it 'should reset housing fields if assistedHousing pref not available on this listing', ->
        spyOn(fakeListingService, 'hasPreference').and.returnValue(false)
        fakeApplication.hasPublicHousing = 'Yes'
        ShortFormDataService._autofillReset(fakeApplication)
        expect(fakeApplication.hasPublicHousing).toBeUndefined()
        expect(fakeApplication.totalMonthlyRent).toBeUndefined()

      it 'should not reset housing fields if assistedHousing pref is available on this listing', ->
        spyOn(fakeListingService, 'hasPreference').and.returnValue(true)
        fakeApplication.hasPublicHousing = 'Yes'
        ShortFormDataService._autofillReset(fakeApplication)
        expect(fakeApplication.hasPublicHousing).toEqual 'Yes'

    describe '_calculateTotalMonthlyRent', ->
      it 'adds up rent values from groupedHouseholdAddresses', ->
        fakeApplication.groupedHouseholdAddresses = [
          {monthlyRent: 750, dontPayRent: true}
          {monthlyRent: null, dontPayRent: true}
          {monthlyRent: 1000}
        ]
        ShortFormDataService._calculateTotalMonthlyRent(fakeApplication)
        expect(fakeApplication.totalMonthlyRent).toEqual(1750)
