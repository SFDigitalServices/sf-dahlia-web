do ->
  'use strict'
  describe 'Lottery Preference Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakePreference = {
      preferenceName: "Live or Work in San Francisco Preference"
    }
    fakeMissingPreference = {
      preferenceName: "Fake"
    }
    fakeListingDataService =
      listings: fakeListings

    fakeListingIdentityService =
      isSale: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach module('dahlia.services')
    beforeEach inject((_$componentController_, _ListingConstantsService_) ->
      $componentController = _$componentController_

      locals = {
        ListingDataService: fakeListingDataService
        ListingIdentityService: fakeListingIdentityService
      }
      locals.ListingDataService.preferenceMap = _ListingConstantsService_.preferenceMap
      return
    )

    describe 'lotteryPreference with correct reference', ->
      beforeEach ->
        ctrl = $componentController 'lotteryPreference', locals, {preference: fakePreference}

      describe 'isPrefWithProof', ->
        it 'returns true if it has preference', ->
          expect(ctrl.isPrefWithProof()).toEqual true

      describe 'docSection', ->
        it 'returns resident for rental listing', ->
          expect(ctrl.docSection()).toEqual 'resident'

    describe 'lotteryPreference with missing reference', ->
      beforeEach ->
        ctrl = $componentController 'lotteryPreference', locals, {preference: fakeMissingPreference}

      describe 'isPrefWithProof', ->
        it 'returns false if it has preference', ->
          expect(ctrl.isPrefWithProof()).toEqual false
