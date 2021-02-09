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
    fakeListingDataService =
        listings: fakeListings
        sortByDate: jasmine.createSpy()
    fakeUnitService = jasmine.createSpy()
    $sce = {
      trustAsResourceUrl: jasmine.createSpy()
    }
    $translate = {
      instant: jasmine.createSpy('$translate.instant').and.returnValue('newmessage')
    }

    $timeout = {}
    $window = {}
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingDataService: fakeListingDataService
        ListingUnitService: fakeUnitService
        $sce: $sce
        $window: $window
        $translate: $translate
        $timeout: $timeout
      }
    )

    describe 'propertyHero', ->
      beforeEach ->
        ctrl = $componentController 'propertyHero', locals, {parent: fakeParent}

      describe 'listingImages', ->
        it 'returns listing.imageURL wrapped in an array', ->
          expect(ctrl.listingImages(fakeListing)).toEqual([fakeListing.imageURL])

      describe 'reservedDescriptorIcon', ->
        it 'calls $sce with right param', ->
          fakeListing.reservedDescriptor = [{name: 'fake'}, {name: 'true'}]
          ctrl.reservedDescriptorIcon(fakeListing, 'true')
          expect($sce.trustAsResourceUrl).toHaveBeenCalledWith('#i-cross')
