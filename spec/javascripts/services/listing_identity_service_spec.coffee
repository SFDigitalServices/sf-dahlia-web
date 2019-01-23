do ->
  'use strict'
  describe 'ListingIdentityService', ->
    ListingIdentityService = undefined
    fakeListing = getJSONFixture('listings-api-show.json')
    fakeListingConstantsService =
      LISTING_MAP: {}
    fakeListingConstantsService.LISTING_MAP[fakeListing.listing.Id] = fakeListing.listing.Name

    tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

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
        expect(ListingIdentityService.listingIs(fakeListing.listing.Name, fakeListing.listing)).toEqual true
      it 'returns false if a name is not given', ->
        expect(ListingIdentityService.listingIs(null, fakeListing)).toEqual false
      it 'returns false if a listing is not given', ->
        expect(ListingIdentityService.listingIs('Fake Listing', null)).toEqual false

    describe 'Service.isFirstComeFirstServe', ->
      it 'calls Service.listingIs with the name "168 Hyde Relisting" and the given listing', ->
        spyOn(ListingIdentityService, 'listingIs')
        ListingIdentityService.isFirstComeFirstServe(fakeListing)
        expect(ListingIdentityService.listingIs).toHaveBeenCalledWith('168 Hyde Relisting', fakeListing)

    describe 'Service.isOpen', ->
      it 'returns true if listing application due date has not passed', ->
        listing = fakeListing.listing
        listing.Application_Due_Date = tomorrow.toString()
        expect(ListingIdentityService.isOpen(listing)).toEqual true
      it 'returns false if listing application due date has passed', ->
        listing = fakeListing.listing
        listing.Application_Due_Date = lastWeek.toString()
        expect(ListingIdentityService.isOpen(listing)).toEqual false

