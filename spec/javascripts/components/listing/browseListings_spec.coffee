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
    fakeSharedService = {}
    fakeIncomeCalculatorService = {
      resetIncomeSources: jasmine.createSpy()
    }
    fakeParent = {
      listing: fakeListing
    }
    fakeListingService =
      listings: fakeListings
      resetEligibilityFilters: jasmine.createSpy()
    fakeListingHelperService =
      priorityLabel: jasmine.createSpy()
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        ListingHelperService: fakeListingHelperService
        SharedService: fakeSharedService
        IncomeCalculatorService: fakeIncomeCalculatorService
        $state: state
      }
    )

    describe 'browseListings', ->
      beforeEach ->
        ctrl = $componentController 'browseListings', locals, {parent: fakeParent}

      describe '$ctrl.clearEligibilityFilters', ->
        it 'expects ListingService.function to be called', ->
          # ctrl.clearEligibilityFilters()
          # expect(fakeListingService.resetEligibilityFilters).toHaveBeenCalled()
        it 'expects IncomeCalculatorService.function to be called', ->
          ctrl.clearEligibilityFilters()
          expect(fakeIncomeCalculatorService.resetIncomeSources).toHaveBeenCalled()