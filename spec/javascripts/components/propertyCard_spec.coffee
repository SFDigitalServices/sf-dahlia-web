do ->
  'use strict'
  describe 'Property Card Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    state = {current: {name: undefined}}
    $translate =
      instant: ->
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeSharedService = {
      showSharing: jasmine.createSpy()
    }
    fakeListing.reservedDescriptor = [{name: 'fake'}, {name: 'not'}]
    fakeListingContainer = {
      listing: fakeListing
      hasEligibilityFilters: () -> null
      openNotMatchListings: []
      openListings: []
      closedListings: []
      lotteryResultsListings: []
      priorityTypeNames: jasmine.createSpy()
    }
    fakeListingDataService =
      listings: fakeListings
      priorityTypes: ->
      reservedLabel: ->
      priorityLabel: ->
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingDataService: fakeListingDataService
        SharedService: fakeSharedService
        $state: state
      }
    )

    describe 'propertyCard', ->
      beforeEach ->
        ctrl = $componentController 'propertyCard', locals, {listingContainer: fakeListingContainer}

      describe '$ctrl.showMatches', ->
        describe 'dahlia.listings-for-rent state with filters available', ->
          it 'returns true', ->
            state.current.name = 'dahlia.listings-for-rent'
            spyOn(fakeListingContainer, 'hasEligibilityFilters').and.returnValue(true)
            expect(ctrl.showMatches()).toEqual true

        describe 'filters unavailable', ->
          it 'returns false', ->
            state.current.name = 'dahlia.listings-for-rent'
            spyOn(fakeListingContainer, 'hasEligibilityFilters').and.returnValue(false)
            expect(ctrl.showMatches()).toEqual false

        describe 'state is not dahlia.listings-for-rent', ->
          it 'returns false', ->
            state.current.name = 'dahlia.home'
            spyOn(fakeListingContainer, 'hasEligibilityFilters').and.returnValue(true)
            expect(ctrl.showMatches()).toEqual false

      describe '$ctrl.isOpenNotMatchListing', ->
        describe 'open not matched listing', ->
          it 'returns true',->
            fakeListingContainer.openNotMatchListings = [fakeListing]
            expect(ctrl.isOpenNotMatchListing(fakeListing)).toEqual true

      describe '$ctrl.isOpenListing', ->
        describe 'open listing', ->
          it 'returns true',->
            fakeListingContainer.openListings = [fakeListing]
            expect(ctrl.isOpenListing(fakeListing)).toEqual true

        describe 'closed listing', ->
          it 'returns false',->
            fakeListingContainer.openListings = []
            expect(ctrl.isOpenListing(fakeListing)).toEqual false

      describe '$ctrl.isClosedListing', ->
        describe 'closed listing', ->
          it 'returns true',->
            fakeListingContainer.closedListings = [fakeListing]
            expect(ctrl.isClosedListing(fakeListing)).toEqual true

      describe '$ctrl.isLotteryResultsListing', ->
        describe 'lottery results listing', ->
          it 'returns true',->
            fakeListingContainer.lotteryResultsListings = [fakeListing]
            expect(ctrl.isLotteryResultsListing(fakeListing)).toEqual true

      describe '$ctrl.showSharing', ->
        it 'calls SharedService.showSharing', ->
          ctrl.showSharing()
          expect(fakeSharedService.showSharing).toHaveBeenCalled()

      describe '$ctrl.priorityTypes', ->
        it 'calls ListingDataService.priorityTypes', ->
          spyOn(fakeListingDataService, 'priorityTypes')
          ctrl.priorityTypes(fakeListing)
          expect(fakeListingDataService.priorityTypes).toHaveBeenCalledWith(fakeListing)

      describe '$ctrl.priorityTypeNames', ->
        it 'calls ListingDataService.priorityTypes', ->
          spyOn(fakeListingDataService, 'priorityLabel')
          spyOn(fakeListingDataService, 'priorityTypes').and.returnValue([1])
          ctrl.priorityTypeNames(fakeListing)
          expect(fakeListingDataService.priorityLabel).toHaveBeenCalledWith(1, 'name')
        it 'calls ListingDataService.priorityTypes', ->
          spyOn(fakeListingDataService, 'priorityTypes')
          spyOn(fakeListingDataService, 'priorityLabel')
          ctrl.priorityTypeNames(fakeListing)
          expect(fakeListingDataService.priorityTypes).toHaveBeenCalledWith(fakeListing)
        it 'returns joined names', ->
          spyOn(fakeListingDataService, 'priorityTypes').and.returnValue([1, 2])
          spyOn(fakeListingDataService, 'priorityLabel')
          ctrl.priorityTypeNames(fakeListing)
          expect(fakeListingDataService.priorityTypes).toHaveBeenCalledWith(fakeListing)

      describe '$ctrl.reservedForLabels', ->
        it 'calls ListingDataService.reservedLabel', ->
          spyOn(fakeListingDataService, 'reservedLabel').and.returnValue('fake')
          ctrl.reservedForLabels(fakeListing)
          expect(fakeListingDataService.reservedLabel).toHaveBeenCalled()
        it 'returns values joined with or', ->
          spyOn(fakeListingDataService, 'reservedLabel').and.returnValue('fake')
          expect(ctrl.reservedForLabels(fakeListing)).toEqual 'fake or fake'
        it 'returns empty string for empty reservedDescriptor', ->
          fakeListing.reservedDescriptor = null
          spyOn(fakeListingDataService, 'reservedLabel').and.returnValue('fake')
          expect(ctrl.reservedForLabels(fakeListing)).toEqual ''

      describe '$ctrl.hasSaleUnitsWithoutParking', ->
        it 'returns true if a listing has a general unit with a without-parking price', ->
          fakeSummaries = [
            {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'},
            {
              'unitType': '1 BR',
              'minPriceWithoutParking': 4000,
              'listingID': 'a0W0P00000F8YG4UAN'
            }]
          listing = {'unitSummaries': {'general': fakeSummaries}}
          expect(ctrl.hasSaleUnitsWithoutParking(listing)).toEqual true
        it 'returns true if a listing has a reserved unit with a without-parking price', ->
          fakeSummaries = [
            {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'},
            {
              'unitType': '1 BR',
              'minPriceWithoutParking': 4000,
              'listingID': 'a0W0P00000F8YG4UAN'
            }]
          listing = {'unitSummaries': {'general': null, 'reserved': fakeSummaries}}
          expect(ctrl.hasSaleUnitsWithoutParking(listing)).toEqual true
        it 'returns false if a listing has no units with a without-parking price', ->
          fakeSummaries = [
            {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'},
            {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'
            }]
          listing = {'unitSummaries': {'general': fakeSummaries, 'reserved': null}}
          expect(ctrl.hasSaleUnitsWithoutParking(listing)).toEqual false

        it 'returns false if a listing has no units', ->
          listing = {'unitSummaries': {'general': null, 'reserved': null}}
          expect(ctrl.hasSaleUnitsWithoutParking(listing)).toEqual false

      describe '$ctrl.hasSaleUnitsWithParking', ->
        it 'returns true if a listing has a general unit with a with-parking price', ->
          fakeSummaries = [
            {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'},
            {
              'unitType': '1 BR',
              'minPriceWithParking': 4000,
              'listingID': 'a0W0P00000F8YG4UAN'
            }]
          listing = {'unitSummaries': {'general': fakeSummaries}}
          expect(ctrl.hasSaleUnitsWithParking(listing)).toEqual true
        it 'returns true if a listing has a reserved unit with a with-parking price', ->
          fakeSummaries = [
            {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'},
            {
              'unitType': '1 BR',
              'minPriceWithParking': 4000,
              'listingID': 'a0W0P00000F8YG4UAN'
            }]
          listing = {'unitSummaries': {'general': null, 'reserved': fakeSummaries}}
          expect(ctrl.hasSaleUnitsWithParking(listing)).toEqual true
        it 'returns false if a listing has no units with a with-parking price', ->
          fakeSummaries = [
            {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'},
            {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'
            }]
          listing = {'unitSummaries': {'general': fakeSummaries, 'reserved': null}}
          expect(ctrl.hasSaleUnitsWithParking(listing)).toEqual false

        it 'returns false if a listing has no units', ->
          listing = {'unitSummaries': {'general': null, 'reserved': null}}
          expect(ctrl.hasSaleUnitsWithParking(listing)).toEqual false

      describe '$ctrl.hasRangeOfPrices', ->
        describe 'with parking', ->
          it 'returns true if max is greater than min', ->
            fakeSummary = {
              'unitType': '1 BR',
              'minPriceWithParking': 4000,
              'maxPriceWithParking': 6000,
              'listingID': 'a0W0P00000F8YG4UAN'
            }
            expect(ctrl.hasRangeOfPrices(fakeSummary, true)).toEqual true
          it 'returns false if max or min is not defined', ->
            fakeSummary = {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'
            }
            expect(ctrl.hasRangeOfPrices(fakeSummary, true)).toEqual false
          it 'returns false if max and min are equal', ->
            fakeSummary = {
              'unitType': '1 BR',
              'minPriceWithParking': 4000,
              'maxPriceWithParking': 4000,
              'listingID': 'a0W0P00000F8YG4UAN'
            }
            expect(ctrl.hasRangeOfPrices(fakeSummary, true)).toEqual false
        describe 'without parking', ->
          it 'returns true if max is greater than min', ->
            fakeSummary = {
              'unitType': '1 BR',
              'minPriceWithoutParking': 4000,
              'maxPriceWithoutParking': 6000,
              'listingID': 'a0W0P00000F8YG4UAN'
            }
            expect(ctrl.hasRangeOfPrices(fakeSummary, false)).toEqual true
          it 'returns false if max or min is not defined', ->
            fakeSummary = {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'
            }
            expect(ctrl.hasRangeOfPrices(fakeSummary, false)).toEqual false
          it 'returns false if max and min are equal', ->
            fakeSummary = {
              'unitType': '1 BR',
              'minPriceWithoutParking': 4000,
              'maxPriceWithoutParking': 4000,
              'listingID': 'a0W0P00000F8YG4UAN'
            }
            expect(ctrl.hasRangeOfPrices(fakeSummary, false)).toEqual false


