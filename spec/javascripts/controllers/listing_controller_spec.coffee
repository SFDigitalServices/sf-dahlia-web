do ->
  'use strict'
  describe 'ListingController', ->

    scope = undefined
    state = {current: {name: undefined}}
    listing = undefined
    yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    fakeListingService = {}
    fakeIncomeCalculatorService = {}
    fakeSharedService = {}
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeListingFavorites = {}
    eligibilityFilterDefaults =
      'household_size': ''
      'income_timeframe': ''
      'income_total': ''
      'include_children_under_6': false
      'children_under_6': ''
    hasFilters = false

    beforeEach module('dahlia.controllers', ($provide) ->
      fakeListingService =
        listings: fakeListings
        openListings: []
        openMatchListings: []
        openNotMatchListings: []
        closedListings: []
        lotteryResultsListings: []
        listing: fakeListing
        favorites: fakeListingFavorites
        maxIncomeLevels: []
        lotteryPreferences: []
        hasEligibilityFilters: () ->
          undefined
      fakeListingService.toggleFavoriteListing = jasmine.createSpy()
      fakeListingService.isFavorited = jasmine.createSpy()
      fakeListingService.openLotteryResultsModal = jasmine.createSpy()
      fakeListingService.eligibility_filters = eligibilityFilterDefaults
      fakeListingService.resetEligibilityFilters = jasmine.createSpy()
      $provide.value 'ListingService', fakeListingService
      fakeIncomeCalculatorService.resetIncomeSources = jasmine.createSpy()
      $provide.value 'IncomeCalculatorService', fakeIncomeCalculatorService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      $controller 'ListingController',
        $scope: scope
        $state: state
        SharedService: fakeSharedService
      return
    )

    describe 'initiates scope defaults values', ->
      it 'populates scope with shared service', ->
        expect(scope.shared).toEqual fakeSharedService
        return

      it 'populates scope with array of listings', ->
        expect(scope.listings).toEqual fakeListings
        return

      it 'populates scope with openListings', ->
        expect(scope.openListings).toBeDefined()
        return

      it 'populates scope with openMatchListings', ->
        expect(scope.openMatchListings).toBeDefined()
        return

      it 'populates scope with openNotMatchListings', ->
        expect(scope.openNotMatchListings).toBeDefined()
        return

      it 'populates scope with closedListings', ->
        expect(scope.closedListings).toBeDefined()
        return

      it 'populates scope with lotteryResultsListings', ->
        expect(scope.lotteryResultsListings).toBeDefined()
        return

      it 'populates scope with a single listing', ->
        expect(scope.listing).toEqual fakeListing
        return

      it 'populates scope with favorites', ->
        expect(scope.favorites).toEqual fakeListingFavorites
        return

      it 'populates scope with activeOptionsClass', ->
        expect(scope.activeOptionsClass).toEqual null
        return

      it 'populates scope with maxIncomeLevels', ->
        expect(scope.maxIncomeLevels).toBeDefined()
        return

      it 'populates scope with lotteryPreferences', ->
        expect(scope.lotteryPreferences).toBeDefined()
        return

      it 'populates scope with filters from ListingService', ->
        expect(scope.eligibilityFilters).toEqual eligibilityFilterDefaults
        return
      return

    describe '$scope.toggleFavoriteListing', ->
      it 'expects ListingService.function to be called', ->
        scope.toggleFavoriteListing 1
        expect(fakeListingService.toggleFavoriteListing).toHaveBeenCalled()
        return
      return

    describe '$scope.toggleApplicationOptions', ->
      it 'toggles showApplicationOptions', ->
        scope.showApplicationOptions = false
        scope.toggleApplicationOptions()
        expect(scope.showApplicationOptions).toEqual true
        return
      return

    describe '$scope.isFavorited', ->
      it 'expects ListingService.isFavorited to be called', ->
        scope.isFavorited(fakeListing)
        expect(fakeListingService.isFavorited).toHaveBeenCalled()
        return
      return

    describe '$scope.igibilityFilters', ->
      it 'expects ListingService.hasEligibilityFilters to be called', ->
        fakeListingService.hasEligibilityFilters = jasmine.createSpy()
        scope.hasEligibilityFilters()
        expect(fakeListingService.hasEligibilityFilters).toHaveBeenCalled()
        return
      return

    describe '$scope.listingApplicationClosed', ->
      describe 'closed listing', ->
        it 'returns true', ->
          closedListing = fakeListing
          closedListing.Application_Due_Date = yesterday
          expect(scope.listingApplicationClosed(closedListing)).toEqual true
          return
        return

      describe 'open listing', ->
        it 'returns false', ->
          openListing = fakeListing
          openListing.Application_Due_Date = tomorrow
          expect(scope.listingApplicationClosed(openListing)).toEqual false
          return
        return
      return

    describe '$scope.lotteryDatePassed', ->
      describe 'passed lottery date', ->
        it 'returns true', ->
          passedLotListing = fakeListing
          passedLotListing.Lottery_Date = yesterday
          expect(scope.lotteryDatePassed(passedLotListing)).toEqual true
          return
        return

      describe 'lottery date today', ->
        it 'returns true', ->
          todayLotListing = fakeListing
          todayLotListing.Lottery_Date = new Date()
          expect(scope.lotteryDatePassed(todayLotListing)).toEqual true
          return
        return

      describe 'lottery date tomorrow', ->
        it 'returns false', ->
          futureLotListing = fakeListing
          futureLotListing.Lottery_Date = tomorrow
          expect(scope.lotteryDatePassed(futureLotListing)).toEqual false
          return
        return

    describe '$scope.openLotteryResultsModal', ->
      it 'expect ListingService.openLotteryResultsModal to be called', ->
        scope.openLotteryResultsModal()
        expect(fakeListingService.openLotteryResultsModal).toHaveBeenCalled()
        return
      return

    describe '$scope.lotteryDateVenueAvailable', ->
      beforeEach ->
        listing = fakeListing
        listing.Lottery_Date = new Date()
        listing.Lottery_Venue = "Exygy"
        listing.Lottery_Street_Address = "312 Deetz, Shasta"

      describe 'listing lottery date, venue and lottery address all have values', ->
        it 'returns true', ->
          expect(scope.lotteryDateVenueAvailable(listing)).toEqual true
          return
        return

      describe 'listing lottery date missing', ->
        it 'returns false', ->
          listing.Lottery_Date = undefined
          expect(scope.lotteryDateVenueAvailable(listing)).toEqual false
          return
        return

      describe 'listing venue missing', ->
        it 'returns false', ->
          listing.Lottery_Venue = undefined
          expect(scope.lotteryDateVenueAvailable(listing)).toEqual false
          return
        return

      describe 'listing lottery address missing', ->
        it 'returns false', ->
          listing.Lottery_Street_Address = undefined
          expect(scope.lotteryDateVenueAvailable(listing)).toEqual false
          return
        return
      return

    describe '$scope.showMatches', ->
      describe 'dahlia.listings state with filters available', ->
        it 'returns true', ->
          state.current.name = 'dahlia.listings'
          spyOn(fakeListingService, 'hasEligibilityFilters').and.returnValue(true)
          expect(scope.showMatches()).toEqual true
          return
        return

      describe 'filters unavailable', ->
        it 'returns false', ->
          state.current.name = 'dahlia.listings'
          spyOn(fakeListingService, 'hasEligibilityFilters').and.returnValue(false)
          expect(scope.showMatches()).toEqual false
          return
        return

      describe 'state is not dahlia.listings', ->
        it 'returns false', ->
          state.current.name = 'dahlia.home'
          spyOn(fakeListingService, 'hasEligibilityFilters').and.returnValue(true)
          expect(scope.showMatches()).toEqual false
          return
        return
      return

    describe '$scope.isOpenListing', ->
      describe 'open listing', ->
        it 'returns true',->
          scope.openListings = [fakeListing]
          expect(scope.isOpenListing(fakeListing)).toEqual true
          return
        return

      describe 'closed listing', ->
        it 'returns false',->
          scope.openListings = []
          expect(scope.isOpenListing(fakeListing)).toEqual false
          return
        return
      return

    describe '$scope.isOpenMatchListing', ->
      describe 'open matched listing', ->
        it 'returns true',->
          scope.openMatchListings = [fakeListing]
          expect(scope.isOpenMatchListing(fakeListing)).toEqual true
          return
        return
      return

    describe '$scope.isOpenNotMatchListing', ->
      describe 'open not matched listing', ->
        it 'returns true',->
          scope.openNotMatchListings = [fakeListing]
          expect(scope.isOpenNotMatchListing(fakeListing)).toEqual true
          return
        return
      return

    describe '$scope.isClosedListing', ->
      describe 'closed listing', ->
        it 'returns true',->
          scope.closedListings = [fakeListing]
          expect(scope.isClosedListing(fakeListing)).toEqual true
          return
        return
      return

    describe '$scope.isLotteryResultsListing', ->
      describe 'lottery results listing', ->
        it 'returns true',->
          scope.lotteryResultsListings = [fakeListing]
          expect(scope.isLotteryResultsListing(fakeListing)).toEqual true
          return
        return
      return

    describe '$scope.clearEligibilityFilters', ->
      it 'expects ListingService.function to be called', ->
        scope.clearEligibilityFilters()
        expect(fakeListingService.resetEligibilityFilters).toHaveBeenCalled()
        return
      it 'expects IncomeCalculatorService.function to be called', ->
        scope.clearEligibilityFilters()
        expect(fakeIncomeCalculatorService.resetIncomeSources).toHaveBeenCalled()
        return
      return

  return
