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
    fakeListingDataService =
      listing:
        preferences: getJSONFixture('listings-api-listing-preferences.json').preferences
      getPreference: jasmine.createSpy()
      getPreferenceById: jasmine.createSpy()
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
    fakeListingPreferenceService =
      hasPreference: ->
      getPreferenceById: ->
    fakeListingUnitService =
      listingHasReservedUnitType: ->

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value 'ListingDataService', fakeListingDataService
      $provide.value 'ListingPreferenceService', fakeListingPreferenceService
      $provide.value 'ListingUnitService', fakeListingUnitService
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

      it 'adds an individual pref for custom preferences if present', ->
        fakeAppWithCustomPrefs = angular.copy(fakeApplication)
        # Fake listing has custom listing id w/ id a0l0P00001PsqDoQAJ
        fakeAppWithCustomPrefs.preferences['a0l0P00001PsqDoQAJ'] = true
        fakeAppWithCustomPrefs.preferences['a0l0P00001PsqDoQAJ_preference'] = 'Works in Public Ed'
        fakeAppWithCustomPrefs.preferences['a0l0P00001PsqDoQAJ_household_member'] = 1
        formattedApp = ShortFormDataService.formatApplication(fakeListingId, fakeAppWithCustomPrefs)
        expectedCustomPref = {
          recordTypeDevName: 'Custom',
          listingPreferenceID: 'a0l0P00001PsqDoQAJ',
          individualPreference: 'Works in Public Ed'
        }
        expect(formattedApp.shortFormPreferences).toContain(expectedCustomPref)

    describe 'reformatApplication', ->
      beforeEach ->
        reformattedApp = ShortFormDataService.reformatApplication(fakeSalesforceApplication)

      it 'renames primaryApplicant to applicant', ->
        expect(reformattedApp.applicant.firstName).toEqual(fakeSalesforceApplication.primaryApplicant.firstName)

      it 'reformats mailing address', ->
        expect(reformattedApp.applicant.mailing_address.address1).toEqual("4053 18TH ST")

      it 'reformats stringified JSON formMetadata', ->
        expect(reformattedApp.completedSections.Intro).toEqual(true)

      it 'reformats custom preferences to include individual preferences', ->
        salesforceAppWithCustomPrefs = angular.copy(fakeSalesforceApplication)
        customPref = {
          'recordTypeDevName': 'Custom',
          'listingPreferenceID': 'listingPrefId',
          'individualPreference': 'Works in Public Ed',
          'shortformPreferenceID': 'shortFormPreferenceID',
          'appMemberID': 'a0pf00000029IWsAAM'
          'optOut': false
        }
        salesforceAppWithCustomPrefs.shortFormPreferences = [customPref]
        fakeListingPref = {
          'preferenceName': 'Employment/Disability Preference',
          'listingPreferenceID': 'listingPrefId',
        }
        spyOn(fakeListingPreferenceService, 'getPreferenceById').and.returnValue(fakeListingPref)
        reformattedApp = ShortFormDataService.reformatApplication(salesforceAppWithCustomPrefs)

        expect(reformattedApp.preferences['listingPrefId_preference']).toEqual('Works in Public Ed')


    describe 'maxDOBDay', ->
      it 'gives max of 30 for appropriate months', ->
        expect(ShortFormDataService.maxDOBDay(4, 2001)).toEqual(30)

      it 'gives max of 31 for appropriate months', ->
        expect(ShortFormDataService.maxDOBDay(5, 2001)).toEqual(31)

      it 'gives max of 29 for leap year', ->
        expect(ShortFormDataService.maxDOBDay(2, 2000)).toEqual(29)

    describe '_autofillReset', ->
      beforeEach ->
        spyOn(fakeListingUnitService, 'listingHasReservedUnitType').and.returnValue(false)

      it 'should reset referral if referral has > 1 response', ->
        fakeApplication.applicant.referral = 'something;something else'
        ShortFormDataService._autofillReset(fakeApplication)
        expect(fakeApplication.applicant.referral).toBeNull()

      it 'should not reset referral if referral has only 1 response', ->
        fakeApplication.applicant.referral = 'something'
        ShortFormDataService._autofillReset(fakeApplication)
        expect(fakeApplication.applicant.referral).toEqual('something')

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

      it 'should reset appMemberId and preferenceAddressMatch fields', ->
        fakeApplication.applicant.appMemberId = '123XYZ'
        fakeApplication.applicant.preferenceAddressMatch = 'Matched'
        ShortFormDataService._autofillReset(fakeApplication)
        expect(fakeApplication.applicant.appMemberId).toBeUndefined()
        expect(fakeApplication.applicant.preferenceAddressMatch).toBeUndefined()

      it 'should reset housing fields if assistedHousing pref not available on this listing', ->
        spyOn(fakeListingPreferenceService, 'hasPreference').and.returnValue(false)
        fakeApplication.hasPublicHousing = 'Yes'
        ShortFormDataService._autofillReset(fakeApplication)
        expect(fakeApplication.hasPublicHousing).toBeUndefined()
        expect(fakeApplication.totalMonthlyRent).toBeUndefined()

      it 'should not reset housing fields if assistedHousing pref is available on this listing', ->
        spyOn(fakeListingPreferenceService, 'hasPreference').and.returnValue(true)
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
        totalMonthlyRent = ShortFormDataService._calculateTotalMonthlyRent(fakeApplication)
        expect(totalMonthlyRent).toEqual(1750)
