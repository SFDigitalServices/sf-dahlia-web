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
    fakeShortFormApplicationService = {}
    fakeAnalyticsService = {}
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
        AMICharts: []
        lotteryPreferences: []
        getLotteryBuckets: () -> null
        getLotteryRanking: () -> null
        hasEligibilityFilters: () -> null
        stubFeatures: () -> null
        listingIs: () -> null
        loading: {}
      fakeListingService.toggleFavoriteListing = jasmine.createSpy()
      fakeListingService.isFavorited = jasmine.createSpy()
      fakeListingService.openLotteryResultsModal = jasmine.createSpy()
      fakeListingService.eligibility_filters = eligibilityFilterDefaults
      fakeListingService.resetEligibilityFilters = jasmine.createSpy()
      fakeListingService.formattedAddress = jasmine.createSpy()
      fakeListingService.listingHasPriorityUnits = jasmine.createSpy()
      fakeListingService.listingHasReservedUnits = jasmine.createSpy()
      fakeListingService.listingHasLotteryResults = jasmine.createSpy()
      fakeListingService.allListingUnitsAvailable = jasmine.createSpy()
      $provide.value 'ListingService', fakeListingService
      fakeIncomeCalculatorService.resetIncomeSources = jasmine.createSpy()
      $provide.value 'IncomeCalculatorService', fakeIncomeCalculatorService
      $provide.value 'ShortFormApplicationService', fakeShortFormApplicationService
      $provide.value 'AnalyticsService', fakeAnalyticsService
      return
    )

    beforeEach inject(($rootScope, $controller, $q) ->
      deferred = $q.defer()
      deferred.resolve('resolveData')
      spyOn(fakeListingService, 'getLotteryBuckets').and.returnValue(deferred.promise)
      spyOn(fakeListingService, 'getLotteryRanking').and.returnValue(deferred.promise)

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

      it 'populates scope with array of listings', ->
        expect(scope.listings).toEqual fakeListings

      it 'populates scope with openListings', ->
        expect(scope.openListings).toBeDefined()

      it 'populates scope with openMatchListings', ->
        expect(scope.openMatchListings).toBeDefined()

      it 'populates scope with openNotMatchListings', ->
        expect(scope.openNotMatchListings).toBeDefined()

      it 'populates scope with closedListings', ->
        expect(scope.closedListings).toBeDefined()

      it 'populates scope with lotteryResultsListings', ->
        expect(scope.lotteryResultsListings).toBeDefined()

      it 'populates scope with a single listing', ->
        expect(scope.listing).toEqual fakeListing

      it 'populates scope with favorites', ->
        expect(scope.favorites).toEqual fakeListingFavorites

      it 'populates scope with AMICharts', ->
        expect(scope.AMICharts).toBeDefined()

      it 'populates scope with lotteryPreferences', ->
        expect(scope.lotteryPreferences).toBeDefined()

      it 'populates scope with filters from ListingService', ->
        expect(scope.eligibilityFilters).toEqual eligibilityFilterDefaults

    describe '$scope.toggleFavoriteListing', ->
      it 'expects ListingService.function to be called', ->
        scope.toggleFavoriteListing 1
        expect(fakeListingService.toggleFavoriteListing).toHaveBeenCalled()

    describe '$scope.toggleApplicationOptions', ->
      it 'toggles showApplicationOptions', ->
        scope.showApplicationOptions = false
        scope.toggleApplicationOptions()
        expect(scope.showApplicationOptions).toEqual true

    describe '$scope.isFavorited', ->
      it 'expects ListingService.isFavorited to be called', ->
        scope.isFavorited(fakeListing)
        expect(fakeListingService.isFavorited).toHaveBeenCalled()

    describe '$scope.hasEligibilityFilters', ->
      it 'expects ListingService.hasEligibilityFilters to be called', ->
        fakeListingService.hasEligibilityFilters = jasmine.createSpy()
        scope.hasEligibilityFilters()
        expect(fakeListingService.hasEligibilityFilters).toHaveBeenCalled()

    describe '$scope.listingApplicationClosed', ->
      it 'expects ListingService.listingIsOpen to be called', ->
        fakeListingService.listingIsOpen = jasmine.createSpy()
        scope.listingApplicationClosed(fakeListing)
        expect(fakeListingService.listingIsOpen).toHaveBeenCalled()

    describe '$scope.openLotteryResultsModal', ->
      it 'expect ListingService.openLotteryResultsModal to be called', ->
        scope.openLotteryResultsModal()
        expect(fakeListingService.openLotteryResultsModal).toHaveBeenCalled()

    describe '$scope.lotteryDateVenueAvailable', ->
      beforeEach ->
        listing = fakeListing
        listing.Lottery_Date = new Date()
        listing.Lottery_Venue = "Exygy"
        listing.Lottery_Street_Address = "123 Main St., San Francisco"

      describe 'listing lottery date, venue and lottery address all have values', ->
        it 'returns true', ->
          expect(scope.lotteryDateVenueAvailable(listing)).toEqual true

      describe 'listing lottery date missing', ->
        it 'returns false', ->
          listing.Lottery_Date = undefined
          expect(scope.lotteryDateVenueAvailable(listing)).toEqual false

      describe 'listing venue missing', ->
        it 'returns false', ->
          listing.Lottery_Venue = undefined
          expect(scope.lotteryDateVenueAvailable(listing)).toEqual false

      describe 'listing lottery address missing', ->
        it 'returns false', ->
          listing.Lottery_Street_Address = undefined
          expect(scope.lotteryDateVenueAvailable(listing)).toEqual false

    describe '$scope.showMatches', ->
      describe 'dahlia.listings state with filters available', ->
        it 'returns true', ->
          state.current.name = 'dahlia.listings'
          spyOn(fakeListingService, 'hasEligibilityFilters').and.returnValue(true)
          expect(scope.showMatches()).toEqual true

      describe 'filters unavailable', ->
        it 'returns false', ->
          state.current.name = 'dahlia.listings'
          spyOn(fakeListingService, 'hasEligibilityFilters').and.returnValue(false)
          expect(scope.showMatches()).toEqual false

      describe 'state is not dahlia.listings', ->
        it 'returns false', ->
          state.current.name = 'dahlia.home'
          spyOn(fakeListingService, 'hasEligibilityFilters').and.returnValue(true)
          expect(scope.showMatches()).toEqual false

    describe '$scope.isOpenListing', ->
      describe 'open listing', ->
        it 'returns true',->
          scope.openListings = [fakeListing]
          expect(scope.isOpenListing(fakeListing)).toEqual true

      describe 'closed listing', ->
        it 'returns false',->
          scope.openListings = []
          expect(scope.isOpenListing(fakeListing)).toEqual false

    describe '$scope.isOpenMatchListing', ->
      describe 'open matched listing', ->
        it 'returns true',->
          scope.openMatchListings = [fakeListing]
          expect(scope.isOpenMatchListing(fakeListing)).toEqual true

    describe '$scope.isOpenNotMatchListing', ->
      describe 'open not matched listing', ->
        it 'returns true',->
          scope.openNotMatchListings = [fakeListing]
          expect(scope.isOpenNotMatchListing(fakeListing)).toEqual true

    describe '$scope.isClosedListing', ->
      describe 'closed listing', ->
        it 'returns true',->
          scope.closedListings = [fakeListing]
          expect(scope.isClosedListing(fakeListing)).toEqual true

    describe '$scope.isLotteryResultsListing', ->
      describe 'lottery results listing', ->
        it 'returns true',->
          scope.lotteryResultsListings = [fakeListing]
          expect(scope.isLotteryResultsListing(fakeListing)).toEqual true

    describe '$scope.clearEligibilityFilters', ->
      it 'expects ListingService.function to be called', ->
        scope.clearEligibilityFilters()
        expect(fakeListingService.resetEligibilityFilters).toHaveBeenCalled()
      it 'expects IncomeCalculatorService.function to be called', ->
        scope.clearEligibilityFilters()
        expect(fakeIncomeCalculatorService.resetIncomeSources).toHaveBeenCalled()

    describe '$scope.formattedBuildingAddress', ->
      it 'expects ListingService.function to be called', ->
        display = 'full'
        scope.formattedBuildingAddress(fakeListing, display)
        expect(fakeListingService.formattedAddress).toHaveBeenCalledWith(fakeListing, 'Building', display)

    describe '$scope.formattedApplicationAddress', ->
      it 'expects ListingService.function to be called', ->
        display = 'full'
        scope.formattedApplicationAddress(fakeListing, display)
        expect(fakeListingService.formattedAddress).toHaveBeenCalledWith(fakeListing, 'Application', display)

    describe '$scope.applicantSelectedForPreference', ->
      describe 'applicant is selected for lottery preference', ->
        it 'returns true', ->
          scope.listing.Lottery_Ranking =
            bucketResults:[{bucketResults: [{preferenceRank: 1}]}]
          expect(scope.applicantSelectedForPreference()).toEqual(true)

      describe 'applicant was not selected for lottery preference', ->
        it 'returns false', ->
          scope.listing.Lottery_Ranking =
            bucketResults:[{bucketResults: []}]
          expect(scope.applicantSelectedForPreference()).toEqual(false)

    describe '$scope.lotteryNumberValid', ->
      describe 'invalid', ->
        it 'returns false', ->
          scope.listing.Lottery_Ranking =
            bucketResults:[{bucketResults: []}]
          expect(scope.lotteryNumberValid()).toEqual(false)

      describe 'valid', ->
        it 'returns true', ->
          scope.listing.Lottery_Ranking =
            bucketResults:[{bucketResults: [{lotteryRank: 1}]}]
          expect(scope.lotteryNumberValid()).toEqual(true)

    describe 'showLotteryRanking', ->
      it 'calls ListingService.getLotteryRanking', ->
        scope.lotterySearchNumber = '22222'
        scope.showLotteryRanking()
        expect(fakeListingService.getLotteryRanking).toHaveBeenCalledWith(scope.lotterySearchNumber)

    describe 'listingHasPriorityUnits', ->
      it 'calls ListingService.listingHasPriorityUnits', ->
        scope.listingHasPriorityUnits()
        expect(fakeListingService.listingHasPriorityUnits).toHaveBeenCalledWith(scope.listing)

    describe 'listingHasReservedUnits', ->
      it 'calls ListingService.listingHasReservedUnits', ->
        scope.listingHasReservedUnits()
        expect(fakeListingService.listingHasReservedUnits).toHaveBeenCalledWith(scope.listing)

    describe 'listingHasLotteryResults', ->
      it 'calls ListingService.listingHasLotteryResults', ->
        scope.listingHasLotteryResults()
        expect(fakeListingService.listingHasLotteryResults).toHaveBeenCalled()

    describe 'allListingUnitsAvailable', ->
      it 'calls ListingService.allListingUnitsAvailable', ->
        scope.allListingUnitsAvailable()
        expect(fakeListingService.allListingUnitsAvailable).toHaveBeenCalledWith(scope.listing)
