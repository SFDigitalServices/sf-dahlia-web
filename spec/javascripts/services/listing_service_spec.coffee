do ->
  'use strict'
  describe 'ListingService', ->

    jasmine.getJSONFixtures().fixturesPath = '/public/json'
    ListingService = undefined
    httpBackend = undefined
    fakeListings = getJSONFixture('/listings.json')
    fakeListing = getJSONFixture('/listings/0.json')
    $localStorage = undefined
    $modal = undefined
    modalMock = undefined
    requestURL = undefined

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$modal', modalMock
      return
    )

    beforeEach inject((_$httpBackend_, _ListingService_, _$localStorage_) ->
      httpBackend = _$httpBackend_
      ListingService = _ListingService_
      $localStorage = _$localStorage_
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
      it 'assigns Service.openListings with an array of all listings', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeListings
        ListingService.getListings()
        httpBackend.flush()
        expect(ListingService.openListings.length).toEqual 1
        return
      it 'assigns Service.closedListings with an array of all listings', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeListings
        ListingService.getListings()
        httpBackend.flush()
        expect(ListingService.closedListings.length).toEqual 2
        return
      it 'assigns Service.lotteryResultsListings with an array of all listings', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeListings
        ListingService.getListings()
        httpBackend.flush()
        expect(ListingService.lotteryResultsListings.length).toEqual 1
        return
      return

    describe 'Service.getListing', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
        return
      it 'assigns Service.listing with an individual listing', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeListing
        ListingService.getListing 0
        httpBackend.flush()
        expect(ListingService.listing).toEqual fakeListing.listing
        return
      return

    describe 'Service.toggleFavoriteListing', ->
      describe 'When a listing is favorited', ->
        expectedResult = [1]
        listingId = 1
        beforeEach ->
          ListingService.favorites = $localStorage.favorites = []
          ListingService.toggleFavoriteListing listingId
          return
        afterEach ->
          return
        it 'should store Service.favorites in localStorage', ->
          expect($localStorage.favorites).toEqual expectedResult
          expect($localStorage.favorites).toEqual ListingService.favorites
          return
        it 'should updated Service.favorites', ->
          expect(ListingService.favorites).toEqual expectedResult
          return
        return

      describe 'When a favorited listing is unfavorited', ->
        expectedResult = []
        listingId = 1
        beforeEach ->
          ListingService.favorites = $localStorage.favorites = []
          #favoriting listing
          ListingService.toggleFavoriteListing listingId
          #unfavoriting listing
          ListingService.toggleFavoriteListing listingId
          return
        afterEach ->
          return
        it 'should update Service.favorites in localStorage', ->
          expect($localStorage.favorites).toEqual expectedResult
          expect($localStorage.favorites).toEqual ListingService.favorites
          return
        it 'should updated Service.favorites', ->
          expect(ListingService.favorites).toEqual expectedResult
          return
        return
      return

    describe 'Service.getFavorites', ->
      describe 'When a listing has been favorited', ->
        beforeEach ->
          ListingService.favorites = $localStorage.favorites = []
        it 'updates Service.favorites with appropriate data', ->
          ListingService.toggleFavoriteListing 1
          expect(ListingService.favorites).toEqual [1]
          return
        return
      return

    describe 'Service.setEligibilityFilters', ->
      describe 'When filters have been set', ->
        fakeFilters =
          household_size: 2
          income_timeframe: 'per_month'
          income_total: 3500
        beforeEach ->
          # reset eligibility filters
          ListingService.setEligibilityFilters angular.copy(ListingService.eligibility_filter_defaults)
        afterEach ->
          # reset eligibility filters
          ListingService.setEligibilityFilters angular.copy(ListingService.eligibility_filter_defaults)
        it 'updates Service.eligibility_filters with appropriate data', ->
          ListingService.setEligibilityFilters(fakeFilters)
          expect(ListingService.eligibility_filters.income_total).toEqual 3500
          expect(ListingService.eligibility_filters.household_size).toEqual 2
          return
        it 'checks if eligibility filters have been set', ->
          expect(ListingService.hasEligibilityFilters()).toEqual false
          ListingService.setEligibilityFilters(fakeFilters)
          expect(ListingService.hasEligibilityFilters()).toEqual true
          return
        it 'returns yearly income', ->
          ListingService.setEligibilityFilters(fakeFilters)
          expect(ListingService.eligibilityYearlyIncome()).toEqual 3500*12
          return
        return
      return

    return
  return
