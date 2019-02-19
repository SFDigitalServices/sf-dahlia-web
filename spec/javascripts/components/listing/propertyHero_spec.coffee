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
    $sce = {
      trustAsResourceUrl: jasmine.createSpy()
    }
    $timeout = {}
    $window = {}
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingDataService: fakeListingDataService
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

      describe 'groupHasUnitsWithParking', ->
        fakeUnitWithParking = {
          'Price_With_Parking': 150000,
          'Unit_Type': '2 BR',
        }
        fakeUnitWithoutPrice = {
          'Unit_Type': '2 BR',
        }
        it 'returns true if group has a unit with parking', ->
          fakeUnitGroup = [fakeUnitWithParking, fakeUnitWithoutPrice]
          expect(ctrl.groupHasUnitsWithParking(fakeUnitGroup)).toEqual true
        it 'returns false if group has no units with parking', ->
          fakeUnitGroup = [fakeUnitWithoutPrice, fakeUnitWithoutPrice]
          expect(ctrl.groupHasUnitsWithParking(fakeUnitGroup)).toEqual false

      describe 'groupHasUnitsWithoutParking', ->
        fakeUnitWithoutParking = {
          'Price_Without_Parking': 150000,
          'Unit_Type': '2 BR',
        }
        fakeUnitWithoutPrice = {
          'Unit_Type': '2 BR',
        }
        it 'returns true if group has a unit without parking', ->
          fakeUnitGroup = [fakeUnitWithoutParking, fakeUnitWithoutPrice]
          expect(ctrl.groupHasUnitsWithoutParking(fakeUnitGroup)).toEqual true
        it 'returns false if group has no units without parking', ->
          fakeUnitGroup = [fakeUnitWithoutPrice, fakeUnitWithoutPrice]
          expect(ctrl.groupHasUnitsWithoutParking(fakeUnitGroup)).toEqual false
