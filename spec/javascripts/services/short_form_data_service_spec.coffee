do ->
  'use strict'
  describe 'ShortFormDataService', ->
    ShortFormDataService = undefined
    formatted = undefined
    reformatted = undefined
    fakeListingId = 'a0WU000000CkiM3MAJ'
    fakeSalesforceApplication = getJSONFixture('sample-salesforce-short-form.json')
    fakeApplication = getJSONFixture('sample-web-short-form.json')
    fakeListingId = 'a0WU000000CkiM3MAJ'

    beforeEach module('dahlia.services', ($provide) ->
      return
    )

    beforeEach inject((_ShortFormDataService_) ->
      ShortFormDataService = _ShortFormDataService_
      return
    )

    describe 'formatApplication', ->
      beforeEach ->
        formatted = ShortFormDataService.formatApplication(fakeListingId, fakeApplication)

      it 'attaches given listingID', ->
        expect(formatted.listingID).toEqual(fakeListingId)
        return

      it 'renames applicant to primaryApplicant', ->
        expect(formatted.primaryApplicant.firstName).toEqual(fakeApplication.applicant.firstName)
        return

    describe 'reformatApplication', ->
      beforeEach ->
        reformatted = ShortFormDataService.reformatApplication(fakeSalesforceApplication)
        return

      it 'renames primaryApplicant to applicant', ->
        expect(reformatted.applicant.firstName).toEqual(fakeSalesforceApplication.primaryApplicant.firstName)
        return

      it 'reformats multiselect to object with "true"', ->
        expect(reformatted.applicant.gender).toEqual({Male: true})
        return

      it 'reformats mailing address', ->
        expect(reformatted.applicant.mailing_address.address1).toEqual("4053 18TH ST")
        return
