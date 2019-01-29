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
    eligibilityFilterDefaults =
      'household_size': ''
      'income_timeframe': ''
      'income_total': ''
      'include_children_under_6': false
      'children_under_6': ''
    fakeListingEligibilityService = {
      eligibility_filter_defaults: eligibilityFilterDefaults
      eligibility_filters: eligibilityFilterDefaults
      resetEligibilityFilters: jasmine.createSpy()
    }
    fakeParent = {
      listing: fakeListing
    }
    fakeListingDataService =
      listings: fakeListings
      openMatchListings: jasmine.createSpy()
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingDataService: fakeListingDataService
        IncomeCalculatorService: fakeIncomeCalculatorService
        $state: state
        ListingEligibilityService: fakeListingEligibilityService
      }
    )

    describe 'browseListings', ->
      beforeEach ->
        ctrl = $componentController 'browseListings', locals, {parent: fakeParent}

      describe '$ctrl.clearEligibilityFilters', ->
        it 'expects ListingEligibilityService.resetEligibilityFilters to be called', ->
          ctrl.clearEligibilityFilters()
          expect(fakeListingEligibilityService.resetEligibilityFilters).toHaveBeenCalled()
        it 'expects IncomeCalculatorService.resetIncomeSources to be called', ->
          ctrl.clearEligibilityFilters()
          expect(fakeIncomeCalculatorService.resetIncomeSources).toHaveBeenCalled()
