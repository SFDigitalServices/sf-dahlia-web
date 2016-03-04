do ->
  'use strict'
  describe 'ListingController', ->

    scope = undefined
    state = undefined
    fakeListingService = {}
    fakeIncomeCalculatorService = {}
    fakeSharedService = {}
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
      it 'expects ListingService.function to be called', ->
        scope.toggleFavoriteListing 1
        expect(fakeListingService.toggleFavoriteListing).toHaveBeenCalled()
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
