do ->
  'use strict'
  describe 'ListingService', ->
    incomeLevels = undefined
    minMax = undefined
    ListingEligibilityService = undefined
    loading = {}
    error = {}
    fakeListing = getJSONFixture('listings-api-show.json')
    fakeEligibilityListings = getJSONFixture('listings-api-eligibility-listings.json')
    fakeAMI = getJSONFixture('listings-api-ami.json')
    # fakeListingAllSRO has only one unit summary, in general, for SRO
    fakeListingAllSRO = angular.copy(fakeListing.listing)
    fakeListingAllSRO.unitSummaries =
      reserved: null
      general: [angular.copy(fakeListing.listing.unitSummaries.general[0])]
    fakeListingAllSRO.unitSummaries.general[0].unitType = 'SRO'
    fakeListingAllSRO.unitSummaries.general[0].maxOccupancy = 1
    fakeEligibilityFilters =
      household_size: 2
      income_timeframe: 'per_month'
      income_total: 3500
      include_children_under_6: true
      children_under_6: 1
    fakeListingEligibilityService = {
      # setEligibilityFilters: jasmine.createSpy()
    }
    $localStorage = undefined

    # beforeEach module('dahlia.services', ($provide) ->
    #   $provide.value '$translate', $translate
    #   $provide.value 'ModalService', fakeModalService
    #   $provide.value 'ListingEligibilityService', fakeListingEligibilityService
    #   return
    # )

    beforeEach module('dahlia.services', ->
    )

    beforeEach inject((_ListingEligibilityService_, _$localStorage_) ->
      $localStorage = _$localStorage_
      ListingEligibilityService = _ListingEligibilityService_
      return
    )

    describe 'Service.setEligibilityFilters', ->
      describe 'When filters have been set', ->
        beforeEach ->
          # reset eligibility filters
          ListingEligibilityService.setEligibilityFilters angular.copy(ListingEligibilityService.eligibility_filter_defaults)
        afterEach ->
          # reset eligibility filters
          ListingEligibilityService.setEligibilityFilters angular.copy(ListingEligibilityService.eligibility_filter_defaults)
        it 'updates Service.eligibility_filters with appropriate data', ->
          ListingEligibilityService.setEligibilityFilters(fakeEligibilityFilters)
          expect(ListingEligibilityService.eligibility_filters.income_total).toEqual 3500
          expect(ListingEligibilityService.eligibility_filters.household_size).toEqual 2
        it 'checks if eligibility filters have been set', ->
          expect(ListingEligibilityService.hasEligibilityFilters()).toEqual false
          ListingEligibilityService.setEligibilityFilters(fakeEligibilityFilters)
          expect(ListingEligibilityService.hasEligibilityFilters()).toEqual true
        it 'returns yearly income', ->
          ListingEligibilityService.setEligibilityFilters(fakeEligibilityFilters)
          expect(ListingEligibilityService.eligibilityYearlyIncome()).toEqual 3500*12

    describe 'Service.incomeForHouseholdSize', ->
      it 'should get the income amount for the selected AMI Chart and householdIncomeLevel', ->
        fakeChart = fakeAMI.ami[0]
        fakeIncomeLevel = {numOfHousehold: 2}
        amount = ListingEligibilityService.incomeForHouseholdSize(fakeChart, fakeIncomeLevel)
        expect(amount).toEqual fakeChart.values[1].amount

    describe 'Service.occupancyIncomeLevels', ->
      beforeEach ->
        incomeLevels = ListingEligibilityService.occupancyIncomeLevels(fakeListing.listing, fakeAMI.ami[0])
        minMax = ListingEligibilityService.occupancyMinMax(fakeListing.listing)
      it 'should filter the incomeLevels to start from min household', ->
        expect(incomeLevels[0].numOfHousehold).toEqual minMax[0]
      it 'should filter the incomeLevels to end at max household + 2', ->
        expect(incomeLevels.slice(-1)[0].numOfHousehold).toEqual minMax[1] + 2
      it 'should filter the incomeLevels to only show 1 person if all SROs', ->
        incomeLevels = ListingEligibilityService.occupancyIncomeLevels(fakeListingAllSRO, fakeAMI.ami[0])
        minMax = ListingEligibilityService.occupancyMinMax(fakeListingAllSRO)
        expect(incomeLevels.slice(-1)[0].numOfHousehold).toEqual 1

    describe 'Service.householdAMIChartCutoff', ->
      it 'returns 1 if all units are SROs', ->
        expect(ListingEligibilityService.householdAMIChartCutoff(fakeListingAllSRO)).toEqual(1)