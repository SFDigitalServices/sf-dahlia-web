do ->
  'use strict'
  describe 'ListingIdentityService', ->
    ListingIdentityService = undefined
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeListingConstantsService =
      LISTING_MAP: {}
    fakeListingConstantsService.LISTING_MAP[fakeListing.Id] = fakeListing.Name
    tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    testListing = null

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value 'ListingConstantsService', fakeListingConstantsService
      return
    )

    beforeEach inject((_ListingIdentityService_) ->
      ListingIdentityService = _ListingIdentityService_
      return
    )

    describe 'Service.listingIs', ->
      it 'returns true if the given listing has the given name', ->
        expect(ListingIdentityService.listingIs(fakeListing.Name, fakeListing)).toEqual true
      it 'returns false if a name is not given', ->
        expect(ListingIdentityService.listingIs(null, fakeListing)).toEqual false
      it 'returns false if a listing is not given', ->
        expect(ListingIdentityService.listingIs('Fake Listing', null)).toEqual false

    describe 'Service.isRental', ->
      beforeEach ->
        testListing = angular.copy(fakeListing)

      describe 'when the listing has a rental tenure', ->
        it 'returns true', ->
          testListing.Tenure = 'New rental'
          expect(ListingIdentityService.isRental(testListing)).toEqual true
          testListing.Tenure = 'Re-rental'
          expect(ListingIdentityService.isRental(testListing)).toEqual true

      describe 'when the listing does not have a tenure defined', ->
        it 'returns false', ->
          delete testListing.Tenure
          expect(ListingIdentityService.isRental(testListing)).toEqual false

      describe 'when the listing has a sale tenure', ->
        it 'returns false', ->
          testListing.Tenure = 'New sale'
          expect(ListingIdentityService.isRental(testListing)).toEqual false
          testListing.Tenure = 'Resale'
          expect(ListingIdentityService.isRental(testListing)).toEqual false

    describe 'Service.isSale', ->
      beforeEach ->
        testListing = angular.copy(fakeListing)

      describe 'when the listing has a rental tenure', ->
        it 'returns false', ->
          testListing.Tenure = 'New rental'
          expect(ListingIdentityService.isSale(testListing)).toEqual false
          testListing.Tenure = 'Re-rental'
          expect(ListingIdentityService.isSale(testListing)).toEqual false

      describe 'when the listing does not have a tenure defined', ->
        it 'returns false', ->
          delete testListing.Tenure
          expect(ListingIdentityService.isSale(testListing)).toEqual false

      describe 'when the listing has a sale tenure', ->
        it 'returns true', ->
          testListing.Tenure = 'New sale'
          expect(ListingIdentityService.isSale(testListing)).toEqual true
          testListing.Tenure = 'Resale'
          expect(ListingIdentityService.isSale(testListing)).toEqual true

    describe 'Service.isFirstComeFirstServe', ->
      it 'calls Service.listingIs with the name "168 Hyde Relisting" and the given listing', ->
        spyOn(ListingIdentityService, 'listingIs')
        ListingIdentityService.isFirstComeFirstServe(fakeListing)
        expect(ListingIdentityService.listingIs).toHaveBeenCalledWith('168 Hyde Relisting', fakeListing)

    describe 'Service.isOpen', ->
      beforeEach ->
        testListing = angular.copy(fakeListing)

      it 'returns true if listing application due date has not passed', ->
        testListing.Application_Due_Date = tomorrow.toString()
        expect(ListingIdentityService.isOpen(testListing)).toEqual true
      it 'returns false if listing application due date has passed', ->
        testListing.Application_Due_Date = lastWeek.toString()
        expect(ListingIdentityService.isOpen(testListing)).toEqual false

