do ->
  'use strict'
  describe 'ListingController', ->

    jasmine.getJSONFixtures().fixturesPath = '/public/json'
    scope = undefined
    state = undefined
    fakeListingService = undefined
    fakeListings = getJSONFixture('/listings.json').listings
    fakeListing = getJSONFixture('/listings/0.json').listing
    fakeListingFavorites = {}

    beforeEach module('dahlia.controllers', ($provide) ->
      fakeListingService =
        listings: fakeListings
        listing: fakeListing
        favorites: fakeListingFavorites
      fakeListingService.toggleFavoriteListing = jasmine.createSpy()
      $provide.value 'ListingService', fakeListingService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      $controller 'ListingController',
        $scope: scope
        $state: state
      return
    )

    describe '$scope.listings', ->
      it 'populates scope with array of listings', ->
        expect(scope.listings).toEqual fakeListings
        return
      return

    describe '$scope.listings', ->
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

    describe '$scope.isFavorited', ->

      describe 'listing is favorited', ->
        it 'function returns true', ->
          listingId = fakeListing.id
          scope.favorites[listingId] = true
          expect(scope.isFavorited(listingId)).toEqual true
          return
        return

      describe 'listing is not favorited', ->
        it 'function returns false', ->
          listingId = fakeListing.id
          scope.favorites[listingId] = false
          expect(scope.isFavorited(listingId)).toEqual false
          return
        return
      return
    return
  return
