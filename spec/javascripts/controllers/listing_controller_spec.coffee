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

    beforeEach module('dahlia.controllers', ($provide) ->
      fakeListingService =
        listings: fakeListings
        listing: fakeListing
        favorites: fakeListingFavorites
      fakeListingService.toggleFavoriteListing = jasmine.createSpy()
      fakeListingService.isFavorited = jasmine.createSpy()
      fakeListingService.hasEligibilityFilters = jasmine.createSpy()
      fakeListingService.eligibilityHouseholdSize = jasmine.createSpy()
      fakeListingService.eligibilityIncomeTimeframe = jasmine.createSpy()
      fakeListingService.eligibilityIncomeTotal = jasmine.createSpy()
      fakeListingService.eligibilityChildrenUnder6 = jasmine.createSpy()
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

    describe '$scope.listings', ->
      it 'populates scope with array of listings', ->
        expect(scope.listings).toEqual fakeListings
        return
      return

    describe '$scope.listing', ->
      it 'populates scope with a single listing', ->
        expect(scope.listing).toEqual fakeListing
        return
      return

    describe '$scope.favorites', ->
      it 'populates scope with favorites', ->
        expect(scope.favorites).toEqual fakeListingFavorites
        return
      return

    describe '$scope.toggleFavoriteListing', ->
      it 'expect ListingService.function to be called', ->
        scope.toggleFavoriteListing 1
        expect(fakeListingService.toggleFavoriteListing).toHaveBeenCalled()
        return
      return

    describe '$scope.lotteryDatePassed', ->
      it 'checks for dates that have passed', ->
        # fakeListing lottery date has passed
        expect(scope.lotteryDatePassed(fakeListing)).toEqual true
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

    describe '$scope.hasEligibilityFilters', ->
      it 'expects ListingService.hasEligibilityFilters to be called', ->
        scope.hasEligibilityFilters()
        expect(fakeListingService.hasEligibilityFilters).toHaveBeenCalled()
        return
      return

    describe '$scope.eligibilityHouseholdSize', ->
      it 'expects ListingService.eligibilityHouseholdSize to be called', ->
        scope.eligibilityHouseholdSize()
        expect(fakeListingService.eligibilityHouseholdSize).toHaveBeenCalled()
        return
      return

    describe '$scope.eligibilityIncomeTimeframe', ->
      it 'expects ListingService.eligibilityIncomeTimeframe to be called', ->
        scope.eligibilityIncomeTimeframe()
        expect(fakeListingService.eligibilityIncomeTimeframe).toHaveBeenCalled()
        return
      return

    describe '$scope.eligibilityIncomeTimeframe', ->
      it 'expects ListingService.eligibilityIncomeTimeframe to be called', ->
        scope.eligibilityIncomeTimeframe()
        expect(fakeListingService.eligibilityIncomeTimeframe).toHaveBeenCalled()
        return
      return

  return
