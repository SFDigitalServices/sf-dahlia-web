do ->
  'use strict'
  describe 'ListingEligibilityService', ->
    ListingEligibilityService = undefined
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
    $localStorage = undefined
    incomeLevels = undefined
    minMax = undefined
    $translate =
      use: jasmine.createSpy('$translate.use').and.returnValue('currentLocale')
      instant: ->

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value '$translate', $translate
      return
    )

    beforeEach inject((_$localStorage_, _ListingEligibilityService_) ->
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
        amount = ListingEligibilityService.incomeForHouseholdSize(fakeChart, 2)
        expect(amount).toEqual fakeChart.values[1].amount

    describe 'Service.occupancyMinMax', ->
      it 'returns 1 for min and max if no unit summary is available', ->
        minMax = ListingEligibilityService.occupancyMinMax({})
        expect(minMax).toEqual [1, 1]

      it 'returns min and max occupancies if listing only has one unitSummary', ->
        listing = {'unitSummary': [{'minOccupancy':1, 'maxOccupancy':3}]}
        minMax = ListingEligibilityService.occupancyMinMax(listing)
        expect(minMax).toEqual [1, 3]

      it 'returns the absolute min and absolute max if listing has multiple unit summaries', ->
        listing = {'unitSummary': [
          {'minOccupancy':2, 'maxOccupancy':5},
          {'minOccupancy':3, 'maxOccupancy':6},
          {'minOccupancy':4, 'maxOccupancy':7}
        ]}
        minMax = ListingEligibilityService.occupancyMinMax(listing)
        expect(minMax).toEqual [2, 7]

      it 'returns null for max if the listing is a sale unit and has no maxOccupancy', ->
        listing = {'unitSummary': [
          {'minOccupancy':2},
          {'minOccupancy':3},
          {'minOccupancy':4}
        ]}
        minMax = ListingEligibilityService.occupancyMinMax(listing)
        expect(minMax).toEqual [2, null]

    describe 'Service.householdMinMaxForMaxIncomeTable', ->
      beforeEach ->
        fakeUnitSummaries = [{'minOccupancy': 1, 'maxOccupancy': 3}]
        fakeListing = {'unitSummary': fakeUnitSummaries}
      it 'should return the expected minimum value', ->
        minMax = ListingEligibilityService.householdMinMaxForMaxIncomeTable(fakeListing, fakeAMI.ami)
        expect(minMax.min).toEqual 1
      it 'should return 1 if all units are SROs', ->
        minMax = ListingEligibilityService.householdMinMaxForMaxIncomeTable(fakeListingAllSRO, fakeAMI.ami)
        expect(minMax.min).toEqual 1
        expect(minMax.max).toEqual 1
      it 'should return a max of the max occupancy plus 2 if available on the AMI chart', ->
        minMax = ListingEligibilityService.householdMinMaxForMaxIncomeTable(fakeListing, fakeAMI.ami)
        expect(minMax.max).toEqual 5
      it 'should return all available values from the AMI table if the listing has no max occupancy', ->
        fakeSaleListing = {'unitSummary': [{'minOccupancy': 1}]}
        minMax = ListingEligibilityService.householdMinMaxForMaxIncomeTable(fakeSaleListing, fakeAMI.ami)
        expect(minMax.max).toEqual 8

      describe 'when limited by what\'s available from the AMI charts', ->
        it 'should return the max available AMI value if it\'s smaller than the max occupancy plus 2', ->
          fakeBigUnitListing = {'unitSummary': [{'minOccupancy': 1, 'maxOccupancy': 8}]}
          minMax = ListingEligibilityService.householdMinMaxForMaxIncomeTable(fakeBigUnitListing, fakeAMI.ami)
          expect(minMax.max).toEqual 8
        it 'should return the max available AMI value of the AMI chart with the most available values', ->
          fakeBigUnitListing = {'unitSummary': [{'minOccupancy': 1, 'maxOccupancy': 8}]}
          ami = [
            {'percent': "50", values: [{'numOfHousehold': 8}]},
            {'percent': "55", values: [{'numOfHousehold': 9}]}
          ]
          minMax = ListingEligibilityService.householdMinMaxForMaxIncomeTable(fakeBigUnitListing, ami)
          expect(minMax.max).toEqual 9


    describe 'Service.occupancyIncomeLevels', ->
      describe 'when listing is not an SRO', ->
        beforeEach ->

        it 'should filter the incomeLevels to start from min household', ->
          spyOn(
            ListingEligibilityService, 'householdMinMaxForMaxIncomeTable'
          ).and.returnValue({'min': 2, 'max': 5})
          incomeLevels = ListingEligibilityService.occupancyIncomeLevels(fakeListing.listing, fakeAMI.ami[0])
          expect(incomeLevels[0].numOfHousehold).toEqual 2
        it 'should filter the incomeLevels to end at max value', ->
          spyOn(
            ListingEligibilityService,'householdMinMaxForMaxIncomeTable'
          ).and.returnValue({'min': 2, 'max': 5})
          incomeLevels = ListingEligibilityService.occupancyIncomeLevels(fakeListing.listing, fakeAMI.ami[0])
          expect(incomeLevels.slice(-1)[0].numOfHousehold).toEqual 5

    describe 'Service.hhSizesToShowInMaxIncomeTable', ->
      it 'should return an array with values from the min to max available hh sizes', ->
          spyOn(
            ListingEligibilityService,'householdMinMaxForMaxIncomeTable'
          ).and.returnValue({'min': 2, 'max': 5})
          range = ListingEligibilityService.hhSizesToShowInMaxIncomeTable(fakeListing.listing, fakeAMI.ami[0])
          expect(range).toEqual [2, 3, 4, 5]

    describe 'Service.householdAMIChartCutoff', ->
      it 'returns 1 if all units are SROs', ->
        expect(ListingEligibilityService.householdAMIChartCutoff(fakeListingAllSRO)).toEqual(1)
