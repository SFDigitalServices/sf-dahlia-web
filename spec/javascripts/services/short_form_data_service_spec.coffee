do ->
  'use strict'
  describe 'ShortFormDataService', ->
    ShortFormDataService = undefined
    formattedApp = undefined
    reformattedApp = undefined
    fakeListingId = 'a0WU000000CkiM3MAJ'
    fakeSalesforceApplication = getJSONFixture('sample-salesforce-short-form.json')
    fakeApplication = getJSONFixture('sample-web-short-form.json')
    fakeListingService =
      getPreference: jasmine.createSpy()
      getPreferenceById: jasmine.createSpy()
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

    describe 'maxDOBDay', ->
      it 'gives max of 30 for appropriate months', ->
        expect(ShortFormDataService.maxDOBDay(4, 2001)).toEqual(30)

      it 'gives max of 31 for appropriate months', ->
        expect(ShortFormDataService.maxDOBDay(5, 2001)).toEqual(31)

      it 'gives max of 29 for leap year', ->
        expect(ShortFormDataService.maxDOBDay(2, 2000)).toEqual(29)

    describe '_calculateTotalMonthlyRent', ->
      it 'adds up rent values from groupedHouseholdAddresses', ->
        fakeApplication.groupedHouseholdAddresses = [
          {monthlyRent: 750, dontPayRent: true}
          {monthlyRent: null, dontPayRent: true}
          {monthlyRent: 1000}
        ]
        ShortFormDataService._calculateTotalMonthlyRent(fakeApplication)
        expect(fakeApplication.totalMonthlyRent).toEqual(1750)
