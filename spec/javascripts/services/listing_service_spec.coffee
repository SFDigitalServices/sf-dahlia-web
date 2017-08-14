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
    fakeAMI = getJSONFixture('listings-api-ami.json')
    fakeUnits = getJSONFixture('listings-api-units.json')
    fakePreferences = getJSONFixture('listings-api-listing-preferences.json')
    fakeLotteryResults = getJSONFixture('listings-api-lottery-results.json')
    fakeLotteryBuckets = getJSONFixture('listings-api-lottery-buckets.json')
    fakeLotteryRanking = getJSONFixture('listings-api-lottery-ranking.json')
    fakeEligibilityListings = getJSONFixture('listings-api-eligibility-listings.json')
    fakeEligibilityFilters =
      household_size: 2
      income_timeframe: 'per_month'
      income_total: 3500
      include_children_under_6: true
      children_under_6: 1
    $localStorage = undefined
    $state = undefined
    $translate = {}
    modalMock = undefined
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
      $provide.value '$modal', modalMock
      $provide.value '$translate', $translate
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
        ListingService.setEligibilityFilters(fakeEligibilityFilters)
        ListingService.getListings({checkEligibility: true})
        expect(ListingService.getListingsWithEligibility).toHaveBeenCalled()

    describe 'Service.getListing', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'assigns Service.listing with an individual listing', ->
        fakeListing.listing.Units_Available = 0
        stubAngularAjaxRequest httpBackend, requestURL, fakeListing
        ListingService.getListing 'abc123'
        httpBackend.flush()
        expect(ListingService.listing.Id).toEqual fakeListing.listing.Id

    describe 'Service.getListingAMI', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'assigns Service.AMI with the consolidated AMI results', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeAMI
        ListingService.getListingAMI()
        httpBackend.flush()
        consolidated = ListingService._consolidatedAMICharts(fakeAMI.ami)
        expect(ListingService.AMICharts).toEqual consolidated

    describe 'Service.listingIsOpen', ->
      it 'checks if listing application due date has passed', ->
        listing = fakeListing.listing
        listing.Application_Due_Date = tomorrow.toString()
        expect(ListingService.listingIsOpen(listing)).toEqual true

    describe 'Service.lotteryIsUpcoming', ->
      beforeEach ->
        listing = fakeListing.listing

      it 'returns false when the listing has results and lottery date has not passed', ->
        listing.Lottery_Results = true
        listing.Lottery_Date = tomorrow.toString()
        expect(ListingService.lotteryIsUpcoming(listing)).toEqual false

      it 'returns false when the listing has results and lottery date has passed', ->
        listing.Lottery_Results = true
        listing.Lottery_Date = lastWeek.toString()
        expect(ListingService.lotteryIsUpcoming(listing)).toEqual false

      it 'returns false when the listing has no results and lottery date has passed', ->
        listing.Lottery_Results = false
        listing.Lottery_Date = lastWeek.toString()
        expect(ListingService.lotteryIsUpcoming(listing)).toEqual false

      it 'returns true when the listing has no results and lottery date has not passed', ->
        listing.Lottery_Results = false
        listing.Lottery_Date = tomorrow.toString()
        expect(ListingService.lotteryIsUpcoming(listing)).toEqual true

    describe 'Service.lotteryDatePassed', ->
      it 'checks if listing lottery date has passed', ->
        listing = fakeListing.listing
        listing.Lottery_Date = tomorrow.toString()
        expect(ListingService.lotteryDatePassed(listing)).toEqual false

      it 'checks if listing lottery date has not passed', ->
        listing = fakeListing.listing
        listing.Lottery_Date = lastWeek.toString()
        expect(ListingService.lotteryDatePassed(listing)).toEqual true

    describe 'Service.isAcceptingOnlineApplications', ->
      it 'returns false if an empty listing is passed in', ->
        expect(ListingService.isAcceptingOnlineApplications({})).toEqual false

      it 'returns false if due date has passed', ->
        listing = fakeListing.listing
        past = new Date()
        past.setDate(past.getDate() - 10)
        listing.Application_Due_Date = past.toString()
        expect(ListingService.isAcceptingOnlineApplications(listing)).toEqual false

      it 'returns true if due date in future and Accepting_Online_Applications', ->
        listing = fakeListing.listing
        listing.Accepting_Online_Applications = true
        listing.Application_Due_Date = tomorrow.toString()
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

    describe 'Service.setEligibilityFilters', ->
      describe 'When filters have been set', ->
        beforeEach ->
          # reset eligibility filters
          ListingService.setEligibilityFilters angular.copy(ListingService.eligibility_filter_defaults)
        afterEach ->
          # reset eligibility filters
          ListingService.setEligibilityFilters angular.copy(ListingService.eligibility_filter_defaults)
        it 'updates Service.eligibility_filters with appropriate data', ->
          ListingService.setEligibilityFilters(fakeEligibilityFilters)
          expect(ListingService.eligibility_filters.income_total).toEqual 3500
          expect(ListingService.eligibility_filters.household_size).toEqual 2
        it 'checks if eligibility filters have been set', ->
          expect(ListingService.hasEligibilityFilters()).toEqual false
          ListingService.setEligibilityFilters(fakeEligibilityFilters)
          expect(ListingService.hasEligibilityFilters()).toEqual true
        it 'returns yearly income', ->
          ListingService.setEligibilityFilters(fakeEligibilityFilters)
          expect(ListingService.eligibilityYearlyIncome()).toEqual 3500*12

    describe 'Service.getListingUnits', ->
      beforeEach ->
        # have to populate listing first
        ListingService.listing = fakeListing.listing
        stubAngularAjaxRequest httpBackend, requestURL, fakeUnits
        ListingService.getListingUnits()
        httpBackend.flush()
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'assigns Service.listing.Units with the Unit results', ->
        expect(ListingService.listing.Units).toEqual fakeUnits.units
      it 'assigns Service.listing.groupedUnits with the grouped Unit results', ->
        expect(ListingService.listing.groupedUnits).toEqual ListingService.groupUnitDetails(fakeUnits.units)

    describe 'Service.getListingPreferences', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'assigns Service.listing.preferences with the Preference results', ->
        # have to populate listing first
        ListingService.listing = fakeListing.listing
        # just to divert from our hardcoding
        ListingService.listing.Id = 'fakeId-123'
        stubAngularAjaxRequest httpBackend, requestURL, fakePreferences
        ListingService.getListingPreferences()
        httpBackend.flush()
        expect(ListingService.listing.preferences).toEqual fakePreferences.preferences

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

      it 'calls groupListings function with returned listings', ->
        ListingService.groupListings = jasmine.createSpy()
        ListingService.setEligibilityFilters(fakeEligibilityFilters)
        stubAngularAjaxRequest httpBackend, requestURL, fakeEligibilityListings
        ListingService.getListingsWithEligibility()
        httpBackend.flush()
        expect(ListingService.groupListings).toHaveBeenCalledWith(fakeEligibilityListings.listings)

    describe 'Service.getLotteryBuckets', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'assigns Service.lotteryBucketInfo with bucket results', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeLotteryBuckets
        ListingService.getLotteryBuckets()
        httpBackend.flush()
        expect(ListingService.lotteryBucketInfo).toEqual fakeLotteryBuckets

    describe 'Service.getLotteryRanking', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'assigns Service.lotteryRankingInfo with ranking results', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeLotteryRanking
        ListingService.getLotteryRanking('00042084')
        httpBackend.flush()
        expect(ListingService.lotteryRankingInfo).toEqual fakeLotteryRanking

    describe 'Service.showPreferenceListPDF', ->
      it 'returns true if URL is available and the lottery results are not yet available', ->
        # have to populate listing first
        listing = fakeListing.listing

        # clear any lottery results
        ListingService.lotteryBuckets = []
        ListingService.listing.LotteryResultsURL = null

        listing.NeighborHoodPreferenceUrl = 'http://www.url.com'
        expect(ListingService.showPreferenceListPDF(listing)).toEqual true

      it 'returns false if URL is unavailable', ->
        # have to populate listing first
        listing = fakeListing.listing

        # clear any lottery results
        ListingService.lotteryBuckets = []
        ListingService.listing.LotteryResultsURL = null

        listing.NeighborHoodPreferenceUrl = null
        expect(ListingService.showPreferenceListPDF(listing)).toEqual false

      it 'returns false if the lottery results are available', ->
        # have to populate listing first
        listing = fakeListing.listing
        # presence of LotteryResultsURL means lottery results are available
        ListingService.listing.LotteryResultsURL = "http://anotherurl.com"

        listing.NeighborHoodPreferenceUrl = 'http://www.url.com'
        expect(ListingService.showPreferenceListPDF(listing)).toEqual false

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

    describe 'Service.hasPreference', ->
      describe 'listing has preference', ->
        it 'should return true', ->
          ListingService.listing.preferences = [{preferenceName: 'Live or Work in San Francisco Preference'}]
          expect(ListingService.hasPreference('liveInSf')).toEqual true

      describe 'listing does not have preference', ->
        it 'should return false', ->
          ListingService.listing.preferences = [{preferenceName: 'Live or Work in San Francisco Preference'}]
          expect(ListingService.hasPreference('neighborhoodResidence')).toEqual false

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

    describe 'Service.occupancyIncomeLevels', ->
      beforeEach ->
        # have to populate listing first
        ListingService.listing = fakeListing.listing
        incomeLevels = ListingService.occupancyIncomeLevels(ListingService.listing, fakeAMI.ami[0])
        minMax = ListingService.occupancyMinMax(ListingService.listing)
      it 'should filter the incomeLevels to start from min household', ->
        expect(incomeLevels[0].numOfHousehold).toEqual minMax[0]
      it 'should filter the incomeLevels to end at max household + 2', ->
        expect(incomeLevels.slice(-1)[0].numOfHousehold).toEqual minMax[1] + 2
      it 'should filter the incomeLevels to only show 1 person if all SROs', ->
        ListingService.listing = fakeListingAllSRO
        incomeLevels = ListingService.occupancyIncomeLevels(ListingService.listing, fakeAMI.ami[0])
        minMax = ListingService.occupancyMinMax(ListingService.listing)
        expect(incomeLevels.slice(-1)[0].numOfHousehold).toEqual 1

    describe 'Service.minYearlyIncome', ->
      it 'should get the minimum yearly income for the first (and only) AMI Chart', ->
        ListingService.listing = fakeListing.listing
        ListingService.AMICharts = ListingService._consolidatedAMICharts(fakeAMI.ami)
        incomeLevels = ListingService.occupancyIncomeLevels(ListingService.listing, ListingService.AMICharts[0])
        expect(ListingService.minYearlyIncome()).toEqual incomeLevels[0].amount

    describe 'Service.incomeForHouseholdSize', ->
      it 'should get the income amount for the selected AMI Chart and householdIncomeLevel', ->
        fakeChart = fakeAMI.ami[0]
        fakeIncomeLevel = {numOfHousehold: 2}
        amount = ListingService.incomeForHouseholdSize(fakeChart, fakeIncomeLevel)
        expect(amount).toEqual fakeChart.values[1].amount

    describe 'Service.groupUnitDetails', ->
      it 'should return an object containing a list of units for each AMI level', ->
        grouped = ListingService.groupUnitDetails(fakeUnits.units)
        # fakeUnits just has one AMI level
        expect(_.keys(grouped).length).toEqual 1

    describe 'Service.listingHasLotteryResults', ->
      it 'should be true if lottery PDF is available', ->
        ListingService.listing.LotteryResultsURL = 'http://pdf.url'
        expect(ListingService.listingHasLotteryResults()).toEqual true

      it 'should be true if lottery buckets are available', ->
        ListingService.lotteryBucketInfo = fakeLotteryBuckets
        expect(ListingService.listingHasLotteryResults()).toEqual true

      it 'should be false if lottery buckets and PDF are *not* available', ->
        ListingService.listing.LotteryResultsURL = null
        ListingService.lotteryBucketInfo = {bucketResults: []}
        expect(ListingService.listingHasLotteryResults()).toEqual false

    describe 'Service.listingHasOnlySROUnits', ->
      it 'returns no if not all units are SROs', ->
        ListingService.listing = fakeListing.listing
        ListingService.listing.unitSummaries.general[0].Unit_Type = 'Studio'
        expect(ListingService.listingHasOnlySROUnits(ListingService.listing)).toEqual(false)
      it 'returns yes if all units are SROs', ->
        ListingService.listing = fakeListingAllSRO
        expect(ListingService.listingHasOnlySROUnits(ListingService.listing)).toEqual(true)

    describe 'Service.householdAMIChartCutoff', ->
      it 'returns 1 if all units are SROs', ->
        ListingService.listing = fakeListingAllSRO
        expect(ListingService.householdAMIChartCutoff()).toEqual(1)
