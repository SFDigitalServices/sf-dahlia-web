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
        getLotteryBuckets: () -> null
        getLotteryRanking: () -> null
        hasEligibilityFilters: () -> null
        # TODO: REMOVE HARDCODED FEATURES
        listingIs: () -> null
        listingIsAny: () -> null
      fakeListingService.toggleFavoriteListing = jasmine.createSpy()
      fakeListingService.isFavorited = jasmine.createSpy()
      fakeListingService.openLotteryResultsModal = jasmine.createSpy()
      fakeListingService.eligibility_filters = eligibilityFilterDefaults
      fakeListingService.resetEligibilityFilters = jasmine.createSpy()
      fakeListingService.formattedAddress = jasmine.createSpy()
      $provide.value 'ListingService', fakeListingService
      fakeIncomeCalculatorService.resetIncomeSources = jasmine.createSpy()
      $provide.value 'IncomeCalculatorService', fakeIncomeCalculatorService
      $provide.value 'ShortFormApplicationService', fakeShortFormApplicationService
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

    describe '$scope.hasEligibilityFilters', ->
      it 'expects ListingService.hasEligibilityFilters to be called', ->
        fakeListingService.hasEligibilityFilters = jasmine.createSpy()
        scope.hasEligibilityFilters()
        expect(fakeListingService.hasEligibilityFilters).toHaveBeenCalled()
        return
      return

    describe '$scope.listingApplicationClosed', ->
      it 'expects ListingService.listingIsOpen to be called', ->
        fakeListingService.listingIsOpen = jasmine.createSpy()
        scope.listingApplicationClosed(fakeListing)
        expect(fakeListingService.listingIsOpen).toHaveBeenCalled()
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
      it 'expect ListingService.getLotteryBuckets to be called', ->
        scope.openLotteryResultsModal()
        expect(fakeListingService.getLotteryBuckets).toHaveBeenCalled()
        return
      return

    describe '$scope.lotteryDateVenueAvailable', ->
      beforeEach ->
        listing = fakeListing
        listing.Lottery_Date = new Date()
        listing.Lottery_Venue = "Exygy"
        listing.Lottery_Street_Address = "123 Main St., San Francisco"

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

    describe '$scope.formattedBuildingAddress', ->
      it 'expects ListingService.function to be called', ->
        display = 'full'
        scope.formattedBuildingAddress(fakeListing, display)
        expect(fakeListingService.formattedAddress).toHaveBeenCalledWith(fakeListing, 'Building', display)
        return
      return

    describe '$scope.formattedApplicationAddress', ->
      it 'expects ListingService.function to be called', ->
        display = 'full'
        scope.formattedApplicationAddress(fakeListing, display)
        expect(fakeListingService.formattedAddress).toHaveBeenCalledWith(fakeListing, 'Application', display)
        return
      return

    describe '$scope.lotteryDatePassed', ->
      describe 'passed lottery date', ->
        it 'returns true', ->
          expect(scope.lotteryDatePassed(fakeListing)).toEqual(true)
        return

      describe 'not passed lottery date', ->
        it 'returns false', ->
          listing = fakeListing
          today = new Date()
          tomorrow = new Date()
          tomorrow.setDate(today.getDate()+1)
          listing.Lottery_Date = tomorrow
          expect(scope.lotteryDatePassed(fakeListing)).toEqual(false)
        return
      return

    describe '$scope.applicantSelectedForPreference', ->
      describe 'applicant is selected for lottery preference', ->
        it 'returns true', ->
          scope.listing.Lottery_Ranking =
            applicationResults:[{somePreference: true}]
          expect(scope.applicantSelectedForPreference()).toEqual(true)
          return
        return

      describe 'applicant was not selected for lottery preference', ->
        it 'returns false', ->
          scope.listing.Lottery_Ranking =
            applicationResults:[{somePreference: false}]
          expect(scope.applicantSelectedForPreference()).toEqual(false)
          return
        return
      return

    describe '$scope.lotteryNumberValid', ->
      describe 'invalid', ->
        it 'returns false', ->
          scope.listing.Lottery_Ranking =
            applicationResults: []
          expect(scope.lotteryNumberValid()).toEqual(false)
          return
        return

      describe 'valid', ->
        it 'returns false', ->
          scope.listing.Lottery_Ranking =
            applicationResults: [{somePreference: false}]
          expect(scope.lotteryNumberValid()).toEqual(true)
          return
        return
      return

    describe 'showLotteryRanking', ->
      it 'calls ListingService.getLotteryRanking', ->
        scope.lotterySearchNumber = '22222'
        scope.showLotteryRanking()
        expect(fakeListingService.getLotteryRanking).toHaveBeenCalledWith(scope.lotterySearchNumber)
        return
      return
  return
