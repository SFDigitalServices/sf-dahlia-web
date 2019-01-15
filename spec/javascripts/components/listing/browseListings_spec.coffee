do ->
  'use strict'
  describe 'Browse Listings Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    state = {current: {name: undefined}}
    $translate =
      instant: ->
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeIncomeCalculatorService = {
      resetIncomeSources: jasmine.createSpy()
    }
    fakeParent = {
      listing: fakeListing
    }
    fakeListingService =
      listings: fakeListings
      resetEligibilityFilters: jasmine.createSpy()
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        IncomeCalculatorService: fakeIncomeCalculatorService
        $state: state
      }
    )

    describe 'browseListings', ->
      beforeEach ->
        ctrl = $componentController 'browseListings', locals, {parent: fakeParent}

      describe '$ctrl.clearEligibilityFilters', ->
        it 'expects ListingService.resetEligibilityFilters to be called', ->
          ctrl.clearEligibilityFilters()
          expect(fakeListingService.resetEligibilityFilters).toHaveBeenCalled()
        it 'expects IncomeCalculatorService.resetIncomeSources to be called', ->
          ctrl.clearEligibilityFilters()
          expect(fakeIncomeCalculatorService.resetIncomeSources).toHaveBeenCalled()
