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
    fakeSharedService = {}
    fakeListingContainer = {
      listing: fakeListing
      hasEligibilityFilters: () -> null
      openNotMatchListings: []
      openListings: []
      closedListings: []
      lotteryResultsListings: []
    }
    fakeListingService =
      listings: fakeListings
    fakeListingHelperService =
      priorityLabel: jasmine.createSpy()
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        ListingHelperService: fakeListingHelperService
        SharedService: fakeSharedService
        $state: state
      }
    )

    describe 'propertyCard', ->
      beforeEach ->
        ctrl = $componentController 'propertyCard', locals, {listingContainer: fakeListingContainer}

      describe '$ctrl.showMatches', ->
        describe 'dahlia.listings state with filters available', ->
          it 'returns true', ->
            state.current.name = 'dahlia.listings'
            spyOn(fakeListingContainer, 'hasEligibilityFilters').and.returnValue(true)
            expect(ctrl.showMatches()).toEqual true

        describe 'filters unavailable', ->
          it 'returns false', ->
            state.current.name = 'dahlia.listings'
            spyOn(fakeListingContainer, 'hasEligibilityFilters').and.returnValue(false)
            expect(ctrl.showMatches()).toEqual false

        describe 'state is not dahlia.listings', ->
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