do ->
  'use strict'
  describe 'ListingHelperService', ->

    ListingHelperService = undefined

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

    beforeEach inject((_ListingHelperService_) ->
      ListingHelperService = _ListingHelperService_
      return
    )

    describe 'Service.listingIs', ->
      it 'returns true if the given listing has the given name', ->
        expect(ListingHelperService.listingIs(fakeListing.listing.Name, fakeListing.listing)).toEqual true
      it 'returns false if a name is not given', ->
        expect(ListingHelperService.listingIs(null, fakeListing)).toEqual false
      it 'returns false if a listing is not given', ->
        expect(ListingHelperService.listingIs('Fake Listing', null)).toEqual false

    describe 'Service.listingIsFirstComeFirstServe', ->
      it 'calls Service.listingIs with the name "168 Hyde Relisting" and the given listing', ->
        spyOn(ListingHelperService, 'listingIs')
        ListingHelperService.listingIsFirstComeFirstServe(fakeListing)
        expect(ListingHelperService.listingIs).toHaveBeenCalledWith('168 Hyde Relisting', fakeListing)

    describe 'Service.listingIsOpen', ->
      it 'returns true if listing application due date has not passed', ->
        listing = fakeListing.listing
        listing.Application_Due_Date = tomorrow.toString()
        expect(ListingHelperService.listingIsOpen(listing)).toEqual true
      it 'returns false if listing application due date has passed', ->
        listing = fakeListing.listing
        listing.Application_Due_Date = lastWeek.toString()
        expect(ListingHelperService.listingIsOpen(listing)).toEqual false
