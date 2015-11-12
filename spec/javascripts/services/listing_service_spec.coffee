do ->
  'use strict'
  describe 'ListingService', ->

    jasmine.getJSONFixtures().fixturesPath = '/public/json'
    ListingService = undefined
    httpBackend = undefined
    fakeListings = getJSONFixture('/listings.json')
    fakeListing = getJSONFixture('/listings/0.json')
    $cookies = undefined
    requestURL = undefined

    beforeEach module('dahlia.services', ->
    )

    beforeEach inject((_$httpBackend_, _ListingService_, _$cookies_) ->
      httpBackend = _$httpBackend_
      ListingService = _ListingService_
      $cookies = _$cookies_
      requestURL = ListingService.requestURL
      return
    )

    describe 'Service setup', ->
      it 'initializes defaults', ->
        expect(ListingService.listings).toEqual []
        return
      return

    describe 'Service.getListings', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
        return
      it 'assigns Service.listings with an array of all listings', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeListings
        ListingService.getListings()
        httpBackend.flush()
        expect(ListingService.listings).toEqual fakeListings.listings
        return
      return

    describe 'Service.getListing', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
        return
      it 'assigns Service.listings with an array of all listings', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeListing
        ListingService.getListing 0
        httpBackend.flush()
        expect(ListingService.listing).toEqual fakeListing.listing
        return
      return

    describe 'Service.toggleFavoriteListing', ->
      describe 'When a listing is favorited', ->
        expectedResult = 1: true
        listingId = 1
        beforeEach ->
          ListingService.toggleFavoriteListing listingId
          return
        afterEach ->
          $cookies.remove listingId
          return
        it 'should store Service.favorites in cookies', ->
          cookieQuery = $cookies.getObject('Service.favorites')
          expect(cookieQuery).toEqual expectedResult
          expect(cookieQuery).toEqual ListingService.favorites
          return
        it 'should updated Service.favorites', ->
          expect(ListingService.favorites).toEqual expectedResult
          return
        return

      describe 'When a favorited listing is unfavorited', ->
        expectedResult = 1: false
        listingId = 1
        beforeEach ->
          ListingService.toggleFavoriteListing listingId
          #favoriting listing
          ListingService.toggleFavoriteListing listingId
          #unfavoriting listing
          return
        afterEach ->
          $cookies.remove listingId
          return
        it 'should update Service.favorites in cookies', ->
          cookieQuery = $cookies.getObject('Service.favorites')
          expect(cookieQuery).toEqual expectedResult
          expect(cookieQuery).toEqual ListingService.favorites
          return
        it 'should updated Service.favorites', ->
          expect(ListingService.favorites).toEqual expectedResult
          return
        return
      return

    describe 'Service.getFavorites', ->
      describe 'When a listing has been favorited', ->
        it 'updates Service.favorites with appropriate data', ->
          ListingService.toggleFavoriteListing 1
          ListingService.getFavorites()
          expect(ListingService.favorites).toEqual 1: true
          return
        return
      return
    return
  return
