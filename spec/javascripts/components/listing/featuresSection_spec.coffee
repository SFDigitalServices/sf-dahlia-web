do ->
  'use strict'
  describe 'Feature Section Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $translate =
      instant: ->
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeParent = {
      listing: fakeListing
    }
    fakeListingService =
        listings: fakeListings
        listingIsBMR: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        $translate: $translate
      }
    )

    describe 'featuresSection', ->
      beforeEach ->
        ctrl = $componentController 'featuresSection', locals, {parent: fakeParent}

      describe 'formatBaths', ->
        it 'returns Shared for 0', ->
          expect(ctrl.formatBaths(0)).toEqual('Shared')
        it 'returns a number for whole numbers', ->
          expect(ctrl.formatBaths(1)).toEqual(1)
        it 'appends 1/2 bath when needed', ->
          spyOn($translate, 'instant')
          output = ctrl.formatBaths(1.5)
          expect($translate.instant).toHaveBeenCalledWith('LISTINGS.BATH')
          expect(output).toEqual('1 1/2 ' + $translate.instant('LISTINGS.BATH'))

      describe 'listingIsBMR', ->
        it 'calls ListingService.listingIsBMR', ->
          ctrl.listingIsBMR()
          expect(fakeListingService.listingIsBMR).toHaveBeenCalledWith(ctrl.parent.listing)