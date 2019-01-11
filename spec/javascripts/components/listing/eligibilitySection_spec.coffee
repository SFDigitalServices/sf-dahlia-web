do ->
  'use strict'
  describe 'Eligibility Section Component', ->
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
      listingHasOnlySROUnits: jasmine.createSpy()
      listingHasPriorityUnits: jasmine.createSpy()
    fakeListingHelperService =
      priorityLabel: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        $translate: $translate
        ListingHelperService: fakeListingHelperService
      }
    )

    describe 'eligibilitySection', ->
      beforeEach ->
        ctrl = $componentController 'eligibilitySection', locals, {parent: fakeParent}

      describe 'occupancy', ->
        it 'returns 1 for SRO', ->
          unitSummary = { minOccupancy: 1 , maxOccupancy: 1 }
          expect(ctrl.occupancy(unitSummary)).toEqual('1')
        it 'returns a range for all other unit types', ->
          unitSummary = { minOccupancy: 1 , maxOccupancy: 3 }
          expect(ctrl.occupancy(unitSummary)).toEqual('1-3')

      describe 'occupancyLabel', ->
        it 'calls translate person for 1', ->
          spyOn($translate, 'instant')
          ctrl.occupancyLabel(1)
          expect($translate.instant).toHaveBeenCalledWith('LISTINGS.PERSON')
        it 'calls translate people for more than 1', ->
          spyOn($translate, 'instant')
          ctrl.occupancyLabel(2)
          expect($translate.instant).toHaveBeenCalledWith('LISTINGS.PEOPLE')

      describe 'listingHasOnlySROUnits', ->
        it 'calls ListingService.listingHasOnlySROUnits', ->
          ctrl.listingHasOnlySROUnits()
          expect(fakeListingService.listingHasOnlySROUnits).toHaveBeenCalled()

      describe 'listingHasPriorityUnits', ->
        it 'calls ListingService.listingHasPriorityUnits', ->
          ctrl.listingHasPriorityUnits()
          expect(fakeListingService.listingHasPriorityUnits).toHaveBeenCalledWith(ctrl.parent.listing)