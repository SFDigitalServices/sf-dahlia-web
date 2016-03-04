do ->
  'use strict'
  describe 'ListingController', ->

    scope = undefined
    state = undefined
    fakeListingService = undefined
    fakeSharedService = undefined
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeListingFavorites = {}
    eligibilityFilterDefaults =
      'household_size': ''
      'income_timeframe': ''
      'income_total': ''
      'include_children_under_6': false
      'children_under_6': ''

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
      fakeListingService.toggleFavoriteListing = jasmine.createSpy()
      fakeListingService.isFavorited = jasmine.createSpy()
      fakeListingService.hasEligibilityFilters = jasmine.createSpy()
      fakeListingService.eligibility_filters = eligibilityFilterDefaults
      $provide.value 'ListingService', fakeListingService
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
      it 'expect ListingService.function to be called', ->
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

    describe '$scope.lotteryDatePassed', ->
      it 'checks for dates that have passed', ->
        # fakeListing lottery date has passed
        expect(scope.lotteryDatePassed(fakeListing)).toEqual true
        return
      return

    describe '$scope.isFavorited', ->
      it 'expects ListingService.isFavorited to be called', ->
        scope.isFavorited(fakeListing)
        expect(fakeListingService.isFavorited).toHaveBeenCalled()
        return
      return

    describe '$scope.hasEligibilityFilters', ->
      it 'expects ListingService.hasEligibilityFilters to be called', ->
        scope.hasEligibilityFilters()
        expect(fakeListingService.hasEligibilityFilters).toHaveBeenCalled()
        return
      return
  return
