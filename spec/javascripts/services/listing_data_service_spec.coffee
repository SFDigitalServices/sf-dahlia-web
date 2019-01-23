do ->
  'use strict'
  describe 'ListingDataService', ->
    ListingDataService = undefined
    httpBackend = undefined
    fakeListings = getJSONFixture('listings-api-index.json')
    fakeListing = getJSONFixture('listings-api-show.json')
    fakeAMI = getJSONFixture('listings-api-ami.json')
    fakeEligibilityListings = getJSONFixture('listings-api-eligibility-listings.json')
    fakeEligibilityFilters =
      household_size: 2
      income_timeframe: 'per_month'
      income_total: 3500
      include_children_under_6: true
      children_under_6: 1
    fakeListingConstantsService = {
      defaultApplicationURLs: [{
        'language': 'Spanish'
        'label': 'Español'
        'url': 'http://url.com'
      }]
    }
    fakeListingEligibilityService = {
      eligibilityYearlyIncome: jasmine.createSpy()
      eligibility_filters: fakeEligibilityFilters
      setEligibilityFilters: jasmine.createSpy()
      hasEligibilityFilters: ->
    }
    fakeListingIdentityService =
      listingIs: ->
      isFirstComeFirstServe: ->
      isOpen: ->
    fakeListingLotteryService =
      lotteryBucketInfo: {}
      lotteryRankingInfo: {}
      listingHasLotteryBuckets: ->
      lotteryIsUpcoming: ->
      lotteryComplete: ->
      resetData: jasmine.createSpy()
    fakeSharedService =
      toQueryString: ->
    $localStorage = undefined
    $state = undefined
    $translate = {}
    loading = {}
    error = {}
    requestURL = undefined
    listing = undefined

    beforeEach module('ui.router')
    # have to include http-etag to allow `$http.get(...).success(...).cached(...)` to work in the tests
    beforeEach module('http-etag')
    beforeEach module('dahlia.services', ($provide) ->
      $provide.value '$translate', $translate
      $provide.value 'ListingConstantsService', fakeListingConstantsService
      $provide.value 'ListingEligibilityService', fakeListingEligibilityService
      $provide.value 'ListingIdentityService', fakeListingIdentityService
      $provide.value 'ListingLotteryService', fakeListingLotteryService
      $provide.value 'SharedService', fakeSharedService
      return
    )

    beforeEach inject((_ListingDataService_, _$httpBackend_, _$localStorage_, _$state_) ->
      httpBackend = _$httpBackend_
      $localStorage = _$localStorage_
      $state = _$state_
      $state.go = jasmine.createSpy()
      ListingDataService = _ListingDataService_
      requestURL = ListingDataService.requestURL
      return
    )

    describe 'Service setup', ->
      it 'initializes defaults', ->
        expect(ListingDataService.listings).toEqual []
      it 'initializes defaults', ->
        expect(ListingDataService.openListings).toEqual []

    describe 'Service.groupListings', ->
      it 'assigns ListingDataService listing buckets with grouped arrays of listings', ->
        ListingDataService.groupListings(fakeListings.listings)
        combinedLength =
          ListingDataService.openListings.length +
          ListingDataService.closedListings.length +
          ListingDataService.lotteryResultsListings.length
        expect(combinedLength).toEqual fakeListings.listings.length

        openLength =
          ListingDataService.openMatchListings.length +
          ListingDataService.openNotMatchListings.length
        expect(openLength).toEqual ListingDataService.openListings.length

      it 'sorts groupedListings based on their dates', ->
        ListingDataService.groupListings(fakeListings.listings)
        dates = _.compact(_.map(ListingDataService.lotteryResultsListings, 'Lottery_Results_Date'))
        expect(dates[0] >= dates[1]).toEqual true

    describe 'Service.getListings', ->
      it 'returns Service.getListingsWithEligibility if eligibility options are set', ->
        ListingDataService.getListingsWithEligibility = jasmine.createSpy()
        spyOn(fakeListingEligibilityService, 'hasEligibilityFilters').and.returnValue(true)
        ListingDataService.getListings({checkEligibility: true})
        expect(ListingDataService.getListingsWithEligibility).toHaveBeenCalled()
      it 'calls ListingEligibilityService.eligibilityYearlyIncome', ->
        spyOn(fakeListingEligibilityService, 'hasEligibilityFilters').and.returnValue(true)
        ListingDataService.getListings({checkEligibility: true})
        expect(fakeListingEligibilityService.eligibilityYearlyIncome).toHaveBeenCalled()

    describe 'Service.getListing', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'resets the listing data before getting a new listing', ->
        resetListingData = spyOn(ListingDataService, 'resetListingData')
        stubAngularAjaxRequest httpBackend, requestURL, fakeListing
        ListingDataService.getListing 'abc123'
        httpBackend.flush()
        expect(resetListingData).toHaveBeenCalled()

      it 'does not reset listing data before getting the same listing', ->
        # setup the initial listing
        ListingDataService.listing = angular.copy(fakeListing.listing)

        # request the same listing
        resetListingData = spyOn(ListingDataService, 'resetListingData')
        ListingDataService.getListing ListingDataService.listing.listingID
        expect(resetListingData).not.toHaveBeenCalled()

      it 'assigns Service.listing with an individual listing', ->
        fakeListing.listing.Units_Available = 0
        stubAngularAjaxRequest httpBackend, requestURL, fakeListing
        ListingDataService.getListing 'abc123'
        httpBackend.flush()
        expect(ListingDataService.listing.Id).toEqual fakeListing.listing.Id

    describe 'Service.resetListingData', ->
      it 'resets the listing', ->
        ListingDataService.listing = angular.copy(fakeListing.listing)
        ListingDataService.resetListingData()
        expect(ListingDataService.listing).toEqual {}

      it 'resets the AMICharts', ->
        ListingDataService.AMICharts = ListingDataService._consolidatedAMICharts(fakeAMI.ami)
        ListingDataService.resetListingData()
        expect(ListingDataService.AMICharts).toEqual []

      it 'resets the download URLs', ->
        ListingDataService.listingDownloadURLs = angular.copy(fakeListingConstantsService.defaultApplicationURLs)
        ListingDataService.resetListingData()
        expect(ListingDataService.listingDownloadURLs).toEqual []

      it 'calls ListingLotteryService.resetData', ->
        ListingDataService.resetListingData()
        expect(fakeListingLotteryService.resetData).toHaveBeenCalled()

    describe 'Service.getListingAMI', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'assigns Service.AMI with the consolidated AMI results', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeAMI
        ListingDataService.listing.chartTypes = [{
          year: 2016
          percent: 50
          chartType: "Non-HERA"
        }]
        ListingDataService.getListingAMI()
        httpBackend.flush()
        consolidated = ListingDataService._consolidatedAMICharts(fakeAMI.ami)
        expect(ListingDataService.AMICharts).toEqual consolidated

    describe 'Service.isAcceptingOnlineApplications', ->
      it 'returns false if an empty listing is passed in', ->
        expect(ListingDataService.isAcceptingOnlineApplications({})).toEqual false

      it 'returns false if listing is not open', ->
        listing = fakeListing.listing
        spyOn(fakeListingIdentityService, 'isOpen').and.returnValue(false)
        expect(ListingDataService.isAcceptingOnlineApplications(listing)).toEqual false

      it "returns false if the listing's lottery status is complete", ->
        listing = fakeListing.listing
        spyOn(fakeListingLotteryService, 'lotteryComplete').and.returnValue(true)
        expect(ListingDataService.isAcceptingOnlineApplications(listing)).toEqual false

      it 'returns true if listing is open, Accepting_Online_Applications, and lottery status is not complete', ->
        listing = fakeListing.listing
        listing.Accepting_Online_Applications = true
        spyOn(fakeListingLotteryService, 'lotteryComplete').and.returnValue(false)
        spyOn(fakeListingIdentityService, 'isOpen').and.returnValue(true)
        expect(ListingDataService.isAcceptingOnlineApplications(listing)).toEqual true

    describe 'Service.toggleFavoriteListing', ->
      describe 'When a listing is favorited', ->
        expectedResult = [1]
        listingId = 1
        beforeEach ->
          ListingDataService.favorites = $localStorage.favorites = []
          ListingDataService.toggleFavoriteListing listingId

        it 'should store Service.favorites in localStorage', ->
          expect($localStorage.favorites).toEqual expectedResult
          expect($localStorage.favorites).toEqual ListingDataService.favorites
        it 'should update Service.favorites', ->
          expect(ListingDataService.favorites).toEqual expectedResult

      describe 'When a favorited listing is unfavorited', ->
        expectedResult = []
        listingId = 1
        beforeEach ->
          ListingDataService.favorites = $localStorage.favorites = []
          #favoriting listing
          ListingDataService.toggleFavoriteListing listingId
          #unfavoriting listing
          ListingDataService.toggleFavoriteListing listingId

        it 'should update Service.favorites in localStorage', ->
          expect($localStorage.favorites).toEqual expectedResult
          expect($localStorage.favorites).toEqual ListingDataService.favorites
        it 'should updated Service.favorites', ->
          expect(ListingDataService.favorites).toEqual expectedResult

    describe 'Service.getFavorites', ->
      describe 'When a listing has been favorited', ->
        beforeEach ->
          ListingDataService.favorites = $localStorage.favorites = []
        it 'updates Service.favorites with appropriate data', ->
          ListingDataService.toggleFavoriteListing 1
          expect(ListingDataService.favorites).toEqual [1]
      describe 'When a favorite is not found', ->
        beforeEach ->
          ListingDataService.favorites = $localStorage.favorites = []
        afterEach ->
          httpBackend.verifyNoOutstandingExpectation()
          httpBackend.verifyNoOutstandingRequest()
        it 'removes it from favorites', ->
          # this listing does not exist
          ListingDataService.toggleFavoriteListing '123xyz'
          expect(ListingDataService.favorites).toEqual ['123xyz']
          stubAngularAjaxRequest httpBackend, requestURL, fakeListings
          # this should remove the non-existent favorite
          ListingDataService.getFavoriteListings()
          httpBackend.flush()
          expect(ListingDataService.favorites).toEqual []

    describe 'Service.getListingsByIds', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'assigns Service.listings with the returned listing results', ->
        ListingDataService.listings = [fakeListing]
        listingIds = fakeListings.listings.map((listing) ->
          return listing.id
        )
        stubAngularAjaxRequest httpBackend, requestURL, fakeListings
        ListingDataService.getListingsByIds(listingIds)
        httpBackend.flush()
        expect(ListingDataService.listings).toEqual fakeListings.listings

    describe 'Service.getListingsWithEligibility', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'calls groupListings and cleanListings functions with returned listings', ->
        ListingDataService.cleanListings = jasmine.createSpy()
        ListingDataService.groupListings = jasmine.createSpy()
        stubAngularAjaxRequest httpBackend, requestURL, fakeEligibilityListings
        ListingDataService.getListingsWithEligibility()
        httpBackend.flush()
        expect(ListingDataService.cleanListings).toHaveBeenCalled()
        expect(ListingDataService.groupListings).toHaveBeenCalled()
      it 'calls ListingEligibilityService.eligibilityYearlyIncome', ->
        ListingDataService.cleanListings = jasmine.createSpy()
        ListingDataService.groupListings = jasmine.createSpy()
        stubAngularAjaxRequest httpBackend, requestURL, fakeEligibilityListings
        ListingDataService.getListingsWithEligibility()
        httpBackend.flush()
        expect(fakeListingEligibilityService.eligibilityYearlyIncome).toHaveBeenCalled()

    describe 'Service.sortByDate', ->
      it 'returns sorted list of Open Houses', ->
        listing = fakeListing.listing
        fakeOpenHouses = [
          {Date: '2016-10-15', Start_Time: '10:00 AM'}
          {Date: '2016-10-13', Start_Time: '10:00 AM'} # <-- should be first
          {Date: '2016-10-13', Start_Time: '1:00 PM'}
          {Date: '2016-10-17', Start_Time: '1:00 PM'}
        ]
        sorted = ListingDataService.sortByDate(angular.copy(fakeOpenHouses))
        expect(sorted[0]).toEqual fakeOpenHouses[1]

    describe 'Service.loadListing', ->
      beforeEach ->
        ListingDataService.loadListing(fakeListing.listing)
      it 'should populate Service.listing', ->
        expect(ListingDataService.listing.Id).toEqual fakeListing.listing.Id
      it 'should populate Service.listing.preferences', ->
        count = fakeListing.listing.Listing_Lottery_Preferences.length
        expect(ListingDataService.listing.preferences.length).toEqual count
        prefId = fakeListing.listing.Listing_Lottery_Preferences[0].Id
        expect(ListingDataService.listing.preferences[0].listingPreferenceID).toEqual prefId
