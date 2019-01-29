do ->
  'use strict'
  describe 'Listing Container Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    listing = undefined
    yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    fakeListingDataService = {}
    $translate =
      instant: ->
    fakeSharedService = {}
    fakeShortFormApplicationService =
      getLanguageCode: jasmine.createSpy()
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
    fakeListingEligibilityService = {
      eligibility_filter_defaults: eligibilityFilterDefaults
      eligibility_filters: eligibilityFilterDefaults
      resetEligibilityFilters: jasmine.createSpy()
    }
    hasFilters = false
    fakeListingDataService =
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
      getLotteryRanking: () -> null
      hasEligibilityFilters: () -> null
      stubFeatures: () -> null
      listingIs: () -> null
      loading: {}
      toggleFavoriteListing: jasmine.createSpy()
      isFavorited: jasmine.createSpy()
      formattedAddress: jasmine.createSpy()
      getListingAMI: jasmine.createSpy()
      reservedLabel: jasmine.createSpy()
    fakeListingIdentityService =
      listingIs: jasmine.createSpy()
      isFirstComeFirstServe: jasmine.createSpy()
      isOpen: jasmine.createSpy()
    fakeListingLotteryService =
      getLotteryBuckets: ->
      listingHasLotteryResults: ->
      openLotteryResultsModal: jasmine.createSpy()
    fakeListingUnitService =
      getListingUnits: jasmine.createSpy()
      listingHasReservedUnits: jasmine.createSpy()
      listingHasSROUnits: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        $translate: $translate
        ListingDataService: fakeListingDataService
        ListingEligibilityService: fakeListingEligibilityService
        ListingIdentityService: fakeListingIdentityService
        ListingUnitService: fakeListingUnitService
        SharedService: fakeSharedService
      }
    )

    describe 'listingContainer', ->
      beforeEach ->
        ctrl = $componentController 'listingContainer', locals

      describe 'initiates ctrl default values', ->
        it 'populates ctrl with array of listings', ->
          expect(ctrl.listings).toEqual fakeListings

        it 'populates ctrl with a single listing', ->
          expect(ctrl.listing).toEqual fakeListing

        it 'populates ctrl with AMICharts', ->
          expect(ctrl.AMICharts).toBeDefined()

        it 'populates ctrl with favorites', ->
          expect(ctrl.favorites).toEqual fakeListingFavorites

        it 'populates ctrl with openListings', ->
          expect(ctrl.openListings).toBeDefined()

        it 'populates ctrl with openMatchListings', ->
          expect(ctrl.openMatchListings).toBeDefined()

        it 'populates ctrl with openNotMatchListings', ->
          expect(ctrl.openNotMatchListings).toBeDefined()

        it 'populates ctrl with closedListings', ->
          expect(ctrl.closedListings).toBeDefined()

        it 'populates ctrl with lotteryResultsListings', ->
          expect(ctrl.lotteryResultsListings).toBeDefined()

      describe '$ctrl.isOwnershipListing', ->
        testListing = angular.copy(fakeListing)
        describe 'returns false', ->
          it 'when the listing has a rental Tenure', ->
            testListing.Tenure = 'New rental'
            expect(ctrl.isOwnershipListing(testListing)).toEqual false
          it 'when the listing does not have a tenure defined', ->
            delete testListing.Tenure
            expect(ctrl.isOwnershipListing(testListing)).toEqual false
        describe 'returns true', ->
          it 'when the listing has an ownership tenure', ->
            testListing.Tenure = 'New sale'
            expect(ctrl.isOwnershipListing(testListing)).toEqual true
            testListing.Tenure = 'Resale'
            expect(ctrl.isOwnershipListing(testListing)).toEqual true

      describe '$ctrl.hasOwnAndRentFavorited', ->
        fakeOwnListing = angular.copy(fakeListing)
        fakeOwnListing.Tenure = 'New sale'
        fakeRentListing = angular.copy(fakeListing)
        fakeRentListing.Tenure = 'New rental'

        describe 'when rent and own listings are favorited', ->
          it 'returns true', ->
            listings = [fakeRentListing, fakeOwnListing]
            ctrl.filterByFavorites = jasmine.createSpy().and.returnValue(listings)
            expect(ctrl.hasOwnAndRentFavorited(listings)).toEqual true

        describe 'when no listings are favorited', ->
          it 'returns false', ->
            listings = [fakeRentListing, fakeOwnListing]
            ctrl.filterByFavorites = jasmine.createSpy().and.returnValue([])
            expect(ctrl.hasOwnAndRentFavorited(listings)).toEqual false

        describe 'when only rental listings are favorited', ->
          it 'returns false', ->
            listings = [fakeRentListing]
            ctrl.filterByFavorites = jasmine.createSpy().and.returnValue(listings)
            expect(ctrl.hasOwnAndRentFavorited(listings)).toEqual false

        describe 'when only ownership listings are favorited', ->
          it 'returns false', ->
            listings = [fakeRentListing]
            ctrl.filterByFavorites = jasmine.createSpy().and.returnValue(listings)
            expect(ctrl.hasOwnAndRentFavorited(listings)).toEqual false

      describe '$ctrl.isFavorited', ->
        it 'calls ListingService.isFavorited with the given listing ID', ->
          fakeListingId = 'asdf1234'
          ctrl.isFavorited(fakeListingId)
          expect(fakeListingService.isFavorited).toHaveBeenCalledWith(fakeListingId)

      describe '$ctrl.filterByFavorites', ->
        it "calls ListingService.isFavorited with the given listing's ID", ->
          fakeListingId = 'asdf1234'
          listing = angular.copy(fakeListing)
          listing.Id = fakeListingId
          ctrl.filterByFavorites([listing])
          expect(fakeListingService.isFavorited).toHaveBeenCalledWith(fakeListingId)

        it 'filters out non-favorited listings', ->
          ctrl.isFavorited = jasmine.createSpy().and.returnValues(false, true, false)
          results = ctrl.filterByFavorites([fakeListing, fakeListing, fakeListing])
          expect(results.length).toEqual(1)

      describe '$ctrl.isOpenMatchListing', ->
        describe "when the given listing is in the controller's list of open match listings", ->
          it 'returns true',->
            ctrl.openMatchListings = [fakeListing]
            expect(ctrl.isOpenMatchListing(fakeListing)).toEqual true
        describe "when the given listing is not in the controller's list of open match listings", ->
          it 'returns false',->
            ctrl.openMatchListings = []
            expect(ctrl.isOpenMatchListing(fakeListing)).toEqual false

      describe '$ctrl.reservedLabel', ->
        it 'calls ListingDataService.reservedLabel with the given arguments', ->
          type = 'foo'
          modifier = 'bar'
          ctrl.reservedLabel(fakeListing, type, modifier)
          expect(fakeListingDataService.reservedLabel).toHaveBeenCalledWith(fakeListing, type, modifier)

      describe '$ctrl.getListingAMI', ->
        it 'calls ListingDataService.getListingAMI with the given listing', ->
          ctrl.getListingAMI(fakeListing)
          expect(fakeListingDataService.getListingAMI).toHaveBeenCalledWith(fakeListing)

      describe '$ctrl.listingIsReservedCommunity', ->
        it "returns true if the listing's Reserved_community_type property is truthy", ->
          listing = fakeListing
          listing.Reserved_community_type = 'Senior'
          expect(ctrl.listingIsReservedCommunity(listing)).toEqual true
        it "returns false if the listing's Reserved_community_type property is falsey", ->
          listing = fakeListing
          listing.Reserved_community_type = null
          expect(ctrl.listingIsReservedCommunity(listing)).toEqual false

      describe '$ctrl.listingIs', ->
        it 'calls ListingIdentityService.listingIs with the given name and listing', ->
          name = 'fake'
          ctrl.listingIs(name, fakeListing)
          expect(fakeListingIdentityService.listingIs).toHaveBeenCalledWith(name, fakeListing)

      describe '$ctrl.listingHasReservedUnits', ->
        it "calls ListingUnitService.listingHasReservedUnits with the given listing", ->
          ctrl.listingHasReservedUnits(fakeListing)
          expect(fakeListingUnitService.listingHasReservedUnits).toHaveBeenCalledWith(fakeListing)

      describe '$ctrl.isFirstComeFirstServe', ->
        it 'calls ListingIdentityService.isFirstComeFirstServe with the given listing', ->
          ctrl.isFirstComeFirstServe(fakeListing)
          expect(fakeListingIdentityService.isFirstComeFirstServe).toHaveBeenCalledWith(fakeListing)

      describe '$ctrl.toggleFavoriteListing', ->
        it 'expects ListingDataService.function to be called', ->
          ctrl.toggleFavoriteListing 1
          expect(fakeListingDataService.toggleFavoriteListing).toHaveBeenCalled()

      describe '$ctrl.hasEligibilityFilters', ->
        it 'expects fakeListingEligibilityService.hasEligibilityFilters to be called', ->
          fakeListingEligibilityService.hasEligibilityFilters = jasmine.createSpy()
          ctrl.hasEligibilityFilters()
          expect(fakeListingEligibilityService.hasEligibilityFilters).toHaveBeenCalled()

      describe '$ctrl.listingApplicationClosed', ->
        it 'expects ListingIdentityService.isOpen to be called', ->
          ctrl.listingApplicationClosed(fakeListing)
          expect(fakeListingIdentityService.isOpen).toHaveBeenCalled()

      describe '$ctrl.lotteryDateVenueAvailable', ->
        beforeEach ->
          listing = fakeListing
          listing.Lottery_Date = new Date()
          listing.Lottery_Venue = "Exygy"
          listing.Lottery_Street_Address = "123 Main St., San Francisco"

        describe 'listing lottery date, venue and lottery address all have values', ->
          it 'returns true', ->
            expect(ctrl.lotteryDateVenueAvailable(listing)).toEqual true

        describe 'listing lottery date missing', ->
          it 'returns false', ->
            listing.Lottery_Date = undefined
            expect(ctrl.lotteryDateVenueAvailable(listing)).toEqual false

        describe 'listing venue missing', ->
          it 'returns false', ->
            listing.Lottery_Venue = undefined
            expect(ctrl.lotteryDateVenueAvailable(listing)).toEqual false

        describe 'listing lottery address missing', ->
          it 'returns false', ->
            listing.Lottery_Street_Address = undefined
            expect(ctrl.lotteryDateVenueAvailable(listing)).toEqual false

      describe '$ctrl.formattedBuildingAddress', ->
        it 'expects ListingDataService.formattedAddress to be called', ->
          display = 'full'
          ctrl.formattedBuildingAddress(fakeListing, display)
          expect(fakeListingDataService.formattedAddress).toHaveBeenCalledWith(fakeListing, 'Building', display)

      describe '$ctrl.getListingUnits', ->
        it 'calls ListingUnitService.getListingUnits with the given listing', ->
          ctrl.getListingUnits(fakeListing)
          expect(fakeListingUnitService.getListingUnits).toHaveBeenCalledWith(fakeListing)

      describe '$ctrl.formattedLeasingAgentAddress', ->
        it 'calls ListingDataService.formattedAddress', ->
          ctrl.formattedLeasingAgentAddress(fakeListing)
          expect(fakeListingDataService.formattedAddress).toHaveBeenCalledWith(fakeListing, 'Leasing_Agent')

      describe '$ctrl.listingHasSROUnits', ->
        it 'calls ListingUnitService.listingHasSROUnits with the given listing', ->
          ctrl.listingHasSROUnits(fakeListing)
          expect(fakeListingUnitService.listingHasSROUnits).toHaveBeenCalledWith(fakeListing)
