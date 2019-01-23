do ->
  'use strict'
  describe 'ListingService', ->

    ListingService = undefined
    httpBackend = undefined
    fakeListings = getJSONFixture('listings-api-index.json')
    fakeListing = getJSONFixture('listings-api-show.json')
    # fakeListingAllSRO has only one unit summary, in general, for SRO
    fakeListingAllSRO = angular.copy(fakeListing.listing)
    fakeListingAllSRO.unitSummaries =
      reserved: null
      general: [angular.copy(fakeListing.listing.unitSummaries.general[0])]
    fakeListingAllSRO.unitSummaries.general[0].unitType = 'SRO'
    fakeListingAllSRO.unitSummaries.general[0].maxOccupancy = 1
    # fakeListingSomeSRO has two unit summaries in general, one for SRO, one for 1 BR
    fakeListingSomeSRO = angular.copy(fakeListingAllSRO)
    fakeListingSomeSRO.unitSummaries.general.push(angular.copy(fakeListing.listing.unitSummaries.general[0]))
    fakeListingConstantsService = {
      defaultApplicationURLs: [{
        'language': 'Spanish'
        'label': 'EspaÃ±ol'
        'url': 'http://url.com'
      }]
      LISTING_MAP: {}
    }
    fakeAMI = getJSONFixture('listings-api-ami.json')
    loading = {}
    error = {}
    fakePreferences = getJSONFixture('listings-api-listing-preferences.json')
    fakeCustomPrefs = [
          {preferenceName: 'DACA Fund', listingPreferenceID: '1233'}
          {preferenceName: 'Households with Pet Zebras', listingPreferenceID: '1234'}
        ]
    fakeEligibilityListings = getJSONFixture('listings-api-eligibility-listings.json')
    fakeEligibilityFilters =
      household_size: 2
      income_timeframe: 'per_month'
      income_total: 3500
      include_children_under_6: true
      children_under_6: 1
    fakeListingEligibilityService = {
      eligibilityYearlyIncome: jasmine.createSpy()
      eligibility_filters: fakeEligibilityFilters
      setEligibilityFilters: jasmine.createSpy()
      hasEligibilityFilters: ->
    }
    fakeListingHelperService =
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
    requestURL = undefined
    incomeLevels = undefined
    minMax = undefined
    tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    listing = undefined

    beforeEach module('ui.router')
    # have to include http-etag to allow `$http.get(...).success(...).cached(...)` to work in the tests
    beforeEach module('http-etag')
    beforeEach module('dahlia.services', ($provide) ->
      $provide.value '$translate', $translate
      $provide.value 'ListingConstantsService', fakeListingConstantsService
      $provide.value 'ListingEligibilityService', fakeListingEligibilityService
      $provide.value 'ListingHelperService', fakeListingHelperService
      $provide.value 'ListingLotteryService', fakeListingLotteryService
      $provide.value 'SharedService', fakeSharedService
      return
    )

    beforeEach inject((_ListingService_, _$httpBackend_, _$localStorage_, _$state_) ->
      httpBackend = _$httpBackend_
      $localStorage = _$localStorage_
      $state = _$state_
      $state.go = jasmine.createSpy()
      ListingService = _ListingService_
      requestURL = ListingService.requestURL
      return
    )

    describe 'Service setup', ->
      it 'initializes defaults', ->
        expect(ListingService.listings).toEqual []
      it 'initializes defaults', ->
        expect(ListingService.openListings).toEqual []

    describe 'Service.groupListings', ->
      it 'assigns ListingService listing buckets with grouped arrays of listings', ->
        ListingService.groupListings(fakeListings.listings)
        combinedLength =
          ListingService.openListings.length +
          ListingService.closedListings.length +
          ListingService.lotteryResultsListings.length
        expect(combinedLength).toEqual fakeListings.listings.length

        openLength =
          ListingService.openMatchListings.length +
          ListingService.openNotMatchListings.length
        expect(openLength).toEqual ListingService.openListings.length

      it 'sorts groupedListings based on their dates', ->
        ListingService.groupListings(fakeListings.listings)
        dates = _.compact(_.map(ListingService.lotteryResultsListings, 'Lottery_Results_Date'))
        expect(dates[0] >= dates[1]).toEqual true

    describe 'Service.getListings', ->
      it 'returns Service.getListingsWithEligibility if eligibility options are set', ->
        ListingService.getListingsWithEligibility = jasmine.createSpy()
        spyOn(fakeListingEligibilityService, 'hasEligibilityFilters').and.returnValue(true)
        ListingService.getListings({checkEligibility: true})
        expect(ListingService.getListingsWithEligibility).toHaveBeenCalled()
      it 'calls ListingEligibilityService.eligibilityYearlyIncome', ->
        spyOn(fakeListingEligibilityService, 'hasEligibilityFilters').and.returnValue(true)
        ListingService.getListings({checkEligibility: true})
        expect(fakeListingEligibilityService.eligibilityYearlyIncome).toHaveBeenCalled()

    describe 'Service.getListing', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'resets the listing data before getting a new listing', ->
        resetListingData = spyOn(ListingService, 'resetListingData')
        stubAngularAjaxRequest httpBackend, requestURL, fakeListing
        ListingService.getListing 'abc123'
        httpBackend.flush()
        expect(resetListingData).toHaveBeenCalled()

      it 'does not reset listing data before getting the same listing', ->
        # setup the initial listing
        ListingService.listing = angular.copy(fakeListing.listing)

        # request the same listing
        resetListingData = spyOn(ListingService, 'resetListingData')
        ListingService.getListing ListingService.listing.listingID
        expect(resetListingData).not.toHaveBeenCalled()

      it 'assigns Service.listing with an individual listing', ->
        fakeListing.listing.Units_Available = 0
        stubAngularAjaxRequest httpBackend, requestURL, fakeListing
        ListingService.getListing 'abc123'
        httpBackend.flush()
        expect(ListingService.listing.Id).toEqual fakeListing.listing.Id

    describe 'Service.resetListingData', ->
      it 'resets the listing', ->
        ListingService.listing = angular.copy(fakeListing.listing)
        ListingService.resetListingData()
        expect(ListingService.listing).toEqual {}

      it 'resets the AMICharts', ->
        ListingService.AMICharts = ListingService._consolidatedAMICharts(fakeAMI.ami)
        ListingService.resetListingData()
        expect(ListingService.AMICharts).toEqual []

      it 'resets the download URLs', ->
        ListingService.listingDownloadURLs = angular.copy(fakeListingConstantsService.defaultApplicationURLs)
        ListingService.resetListingData()
        expect(ListingService.listingDownloadURLs).toEqual []

      it 'calls ListingLotteryService.resetData', ->
        ListingService.resetListingData()
        expect(fakeListingLotteryService.resetData).toHaveBeenCalled()

    describe 'Service.getListingAMI', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'assigns Service.AMI with the consolidated AMI results', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeAMI
        ListingService.listing.chartTypes = [{
          year: 2016
          percent: 50
          chartType: "Non-HERA"
        }]
        ListingService.getListingAMI()
        httpBackend.flush()
        consolidated = ListingService._consolidatedAMICharts(fakeAMI.ami)
        expect(ListingService.AMICharts).toEqual consolidated

    describe 'Service.isAcceptingOnlineApplications', ->
      it 'returns false if an empty listing is passed in', ->
        expect(ListingService.isAcceptingOnlineApplications({})).toEqual false

      it 'returns false if listing is not open', ->
        listing = fakeListing.listing
        spyOn(fakeListingHelperService, 'isOpen').and.returnValue(false)
        expect(ListingService.isAcceptingOnlineApplications(listing)).toEqual false

      it "returns false if the listing's lottery status is complete", ->
        listing = fakeListing.listing
        spyOn(fakeListingLotteryService, 'lotteryComplete').and.returnValue(true)
        expect(ListingService.isAcceptingOnlineApplications(listing)).toEqual false

      it 'returns true if listing is open, Accepting_Online_Applications, and lottery status is not complete', ->
        listing = fakeListing.listing
        listing.Accepting_Online_Applications = true
        spyOn(fakeListingLotteryService, 'lotteryComplete').and.returnValue(false)
        spyOn(fakeListingHelperService, 'isOpen').and.returnValue(true)
        expect(ListingService.isAcceptingOnlineApplications(listing)).toEqual true

    describe 'Service.toggleFavoriteListing', ->
      describe 'When a listing is favorited', ->
        expectedResult = [1]
        listingId = 1
        beforeEach ->
          ListingService.favorites = $localStorage.favorites = []
          ListingService.toggleFavoriteListing listingId

        it 'should store Service.favorites in localStorage', ->
          expect($localStorage.favorites).toEqual expectedResult
          expect($localStorage.favorites).toEqual ListingService.favorites
        it 'should update Service.favorites', ->
          expect(ListingService.favorites).toEqual expectedResult

      describe 'When a favorited listing is unfavorited', ->
        expectedResult = []
        listingId = 1
        beforeEach ->
          ListingService.favorites = $localStorage.favorites = []
          #favoriting listing
          ListingService.toggleFavoriteListing listingId
          #unfavoriting listing
          ListingService.toggleFavoriteListing listingId

        it 'should update Service.favorites in localStorage', ->
          expect($localStorage.favorites).toEqual expectedResult
          expect($localStorage.favorites).toEqual ListingService.favorites
        it 'should updated Service.favorites', ->
          expect(ListingService.favorites).toEqual expectedResult

    describe 'Service.getFavorites', ->
      describe 'When a listing has been favorited', ->
        beforeEach ->
          ListingService.favorites = $localStorage.favorites = []
        it 'updates Service.favorites with appropriate data', ->
          ListingService.toggleFavoriteListing 1
          expect(ListingService.favorites).toEqual [1]
      describe 'When a favorite is not found', ->
        beforeEach ->
          ListingService.favorites = $localStorage.favorites = []
        afterEach ->
          httpBackend.verifyNoOutstandingExpectation()
          httpBackend.verifyNoOutstandingRequest()
        it 'removes it from favorites', ->
          # this listing does not exist
          ListingService.toggleFavoriteListing '123xyz'
          expect(ListingService.favorites).toEqual ['123xyz']
          stubAngularAjaxRequest httpBackend, requestURL, fakeListings
          # this should remove the non-existent favorite
          ListingService.getFavoriteListings()
          httpBackend.flush()
          expect(ListingService.favorites).toEqual []

    describe 'Service.getListingsByIds', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'assigns Service.listings with the returned listing results', ->
        ListingService.listings = [fakeListing]
        listingIds = fakeListings.listings.map((listing) ->
          return listing.id
        )
        stubAngularAjaxRequest httpBackend, requestURL, fakeListings
        ListingService.getListingsByIds(listingIds)
        httpBackend.flush()
        expect(ListingService.listings).toEqual fakeListings.listings

    describe 'Service.getListingsWithEligibility', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'calls groupListings and cleanListings functions with returned listings', ->
        ListingService.cleanListings = jasmine.createSpy()
        ListingService.groupListings = jasmine.createSpy()
        stubAngularAjaxRequest httpBackend, requestURL, fakeEligibilityListings
        ListingService.getListingsWithEligibility()
        httpBackend.flush()
        expect(ListingService.cleanListings).toHaveBeenCalled()
        expect(ListingService.groupListings).toHaveBeenCalled()
      it 'calls ListingEligibilityService.eligibilityYearlyIncome', ->
        ListingService.cleanListings = jasmine.createSpy()
        ListingService.groupListings = jasmine.createSpy()
        stubAngularAjaxRequest httpBackend, requestURL, fakeEligibilityListings
        ListingService.getListingsWithEligibility()
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
        sorted = ListingService.sortByDate(angular.copy(fakeOpenHouses))
        expect(sorted[0]).toEqual fakeOpenHouses[1]

    describe 'Service.loadListing', ->
      beforeEach ->
        ListingService.loadListing(fakeListing.listing)
      it 'should populate Service.listing', ->
        expect(ListingService.listing.Id).toEqual fakeListing.listing.Id
      it 'should populate Service.listing.preferences', ->
        count = fakeListing.listing.Listing_Lottery_Preferences.length
        expect(ListingService.listing.preferences.length).toEqual count
        prefId = fakeListing.listing.Listing_Lottery_Preferences[0].Id
        expect(ListingService.listing.preferences[0].listingPreferenceID).toEqual prefId

