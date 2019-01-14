do ->
  'use strict'
  describe 'Property Hero Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeParent = {
      listing: fakeListing
    }
    fakeListingService =
        listings: fakeListings
        sortByDate: jasmine.createSpy()
    $sce = {
      trustAsResourceUrl: jasmine.createSpy()
    }
    $timeout = {}
    $window = {}
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        $sce: $sce
        $window: $window
        $timeout: $timeout
      }
    )

    describe 'propertyHero', ->
      beforeEach ->
        ctrl = $componentController 'propertyHero', locals, {parent: fakeParent}

      describe 'listingImages', ->
        it 'returns listing.imageURL wrapped in an array', ->
          expect(ctrl.listingImages(fakeListing)).toEqual([fakeListing.imageURL])

      describe 'hasMultipleAMIUnits', ->
        it 'returns true for more than 1 groupedUnits', ->
          fakeListing.groupedUnits = {key: 1, hash: 2}
          expect(ctrl.hasMultipleAMIUnits()).toEqual true
        it 'returns false for less or exactly 1 groupedUnits', ->
          fakeListing.groupedUnits = {key: 1}
          expect(ctrl.hasMultipleAMIUnits()).toEqual false

      describe 'reservedDescriptorIcon', ->
        it 'calls $sce with right param', ->
          fakeListing.reservedDescriptor = [{name: 'fake'}, {name: 'true'}]
          ctrl.reservedDescriptorIcon(fakeListing, 'true')
          expect($sce.trustAsResourceUrl).toHaveBeenCalledWith('#i-cross')