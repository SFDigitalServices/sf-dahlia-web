do ->
  'use strict'
  describe 'ListingUnitService', ->
    ListingUnitService = undefined
    httpBackend = undefined
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeAMI = getJSONFixture('listings-api-ami.json')
    fakeAmiAmiTiers = getJSONFixture('listings-api-ami-ami-tiers.json')
    fakeUnits = getJSONFixture('listings-api-units.json')
    fakeUnitsMinAmi = getJSONFixture('listings-api-units-min-ami.json')
    fakeUnitsSales = getJSONFixture('listings-api-units-sales.json')
    # fakeListingAllSRO has only one unit summary, in general, for SRO
    fakeListingAllSRO = angular.copy(fakeListing)
    fakeListingAllSRO.unitSummaries =
      reserved: null
      general: [angular.copy(fakeListing.unitSummaries.general[0])]
    fakeListingAllSRO.unitSummaries.general[0].unitType = 'SRO'
    fakeListingAllSRO.unitSummaries.general[0].maxOccupancy = 1
    $translate =
      use: jasmine.createSpy('$translate.use').and.returnValue('currentLocale')
      instant: (str, variable ) -> variable['amiPercent']

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value '$translate', $translate
      return
    )

    beforeEach inject((_$httpBackend_, _ListingUnitService_) ->
      httpBackend = _$httpBackend_
      ListingUnitService = _ListingUnitService_
      return
    )

    describe 'Service setup', ->
      it 'initializes property loading as empty object', ->
        expect(ListingUnitService.loading).toEqual {}
      it 'initializes property error as empty object', ->
        expect(ListingUnitService.error).toEqual {}

    describe 'Service._getIncomeLevelLabel', ->
      it 'returns AMI tier label for AMI tiers', ->
        unitSummary = { 'Planning_AMI_Tier': 'Low Income'}
        label = ListingUnitService._getIncomeLevelLabel(unitSummary)

        expect(label).toEqual('Low Income')
      it 'returns formatted AMI percentage if not an AMI tier', ->
        unitSummary = { 'Max_AMI_for_Qualifying_Unit': 60 }
        label = ListingUnitService._getIncomeLevelLabel(unitSummary)

        expect(label).toEqual(60)


    describe 'Service.groupUnitDetails', ->
      beforeEach ->
        ListingUnitService.AMICharts = ListingUnitService._consolidatedAMICharts(fakeAmiAmiTiers.ami)

      it 'should group units by bedroom count', ->
        grouped = ListingUnitService.groupUnitDetails(fakeUnitsMinAmi.units)
        expect(grouped.map((g) -> g.type)).toEqual(['Studio', '1 BR', '2 BR', '3 BR'])

      it 'should group units within bedroom type by AMI level for AMI tier listings', ->
        grouped = ListingUnitService.groupUnitDetails(fakeUnitsMinAmi.units)
        oneBrIncomeLevels = grouped.filter((g) -> g.type == '1 BR')[0].incomeLevels
        expect(oneBrIncomeLevels.map((l) -> l.incomeLevel)).toEqual(['Low Income', 'Moderate Income', 'Middle Income'])

      it 'should group AMI tier units as expected', ->
        grouped = ListingUnitService.groupUnitDetails(fakeUnitsMinAmi.units)
        expectedAmiTierUnitGroups = getJSONFixture('units-ami-tiers-grouped.json')
        expect(grouped).toEqual(expectedAmiTierUnitGroups)

      it 'should group sale units as expected', ->
        grouped = ListingUnitService.groupUnitDetails(fakeUnitsSales.units)
        expectedUnitGroups = getJSONFixture('units-sale-test-listing-grouped.json')
        console.log('grouped', grouped, 'expected', expectedUnitGroups)
        expect(grouped).toEqual(expectedUnitGroups)

      it 'should group units with the bedroom count by AMI level for non-AMI-tier listings', ->
        expect(true).toEqual(false)

      it 'should group units within AMI tiers by price', ->
        expect(true).toEqual(false)


    describe 'Service._sumSimilarUnits', ->
      describe 'for rental units', ->
        it 'should return availability that\'s the sum of sumilar units', ->
          units = [angular.copy(fakeUnits.units[0]), angular.copy(fakeUnits.units[0])]
          summed = ListingUnitService._sumSimilarUnits(units)
          expect(summed.length).toEqual 1
          expect(summed[0].total).toEqual 2
        it 'should not combine units with different rents', ->
          units = [angular.copy(fakeUnits.units[0]), angular.copy(fakeUnits.units[0])]
          units[0]['BMR_Rent_Monthly'] = 1000
          summed = ListingUnitService._sumSimilarUnits(units)
          expect(summed.length).toEqual 2
          expect(summed[0].total).toEqual 1
          expect(summed[1].total).toEqual 1

      describe 'for sale units', ->
        it 'should return availability that\'s the sum of similar units', ->
          units = [angular.copy(fakeUnitsSales.units[0]), angular.copy(fakeUnitsSales.units[0])]
          summed = ListingUnitService._sumSimilarUnits(units)
          expect(summed.length).toEqual 1
          expect(summed[0].total).toEqual 2

        it 'should not combine units with different prices', ->
          units = [angular.copy(fakeUnitsSales.units[0]), angular.copy(fakeUnitsSales.units[0])]
          units[0]['Price_Without_Parking'] = 300000
          summed = ListingUnitService._sumSimilarUnits(units)
          expect(summed.length).toEqual 2
          expect(summed[0].total).toEqual 1
          expect(summed[1].total).toEqual 1

          units = [angular.copy(fakeUnitsSales.units[0]), angular.copy(fakeUnitsSales.units[0])]
          units[0]['Price_With_Parking'] = 300000
          summed = ListingUnitService._sumSimilarUnits(units)
          expect(summed.length).toEqual 2
          expect(summed[0].total).toEqual 1
          expect(summed[1].total).toEqual 1

        it 'should not combine units with different HOA dues', ->
          units = [angular.copy(fakeUnitsSales.units[0]), angular.copy(fakeUnitsSales.units[0])]
          units[0]['HOA_Dues_Without_Parking'] = 400
          summed = ListingUnitService._sumSimilarUnits(units)
          expect(summed.length).toEqual 2
          expect(summed[0].total).toEqual 1
          expect(summed[1].total).toEqual 1

          units = [angular.copy(fakeUnitsSales.units[0]), angular.copy(fakeUnitsSales.units[0])]
          units[0]['HOA_Dues_With_Parking'] = 400
          summed = ListingUnitService._sumSimilarUnits(units)
          expect(summed.length).toEqual 2
          expect(summed[0].total).toEqual 1
          expect(summed[1].total).toEqual 1

    describe 'Service._getIncomeRangesByOccupancy', ->
      beforeEach ->
        ListingUnitService.AMICharts = ListingUnitService._consolidatedAMICharts(fakeAmiAmiTiers.ami)
      it 'gets correct income range for units with min income', ->
        summary = {
          'BMR_Rental_Minimum_Monthly_Income_Needed': 3400.00,
          'AMI_chart_year': 2019,
          'Max_AMI_for_Qualifying_Unit': 65,
          'Planning_AMI_Tier': 'Low Income',
          'Min_Occupancy': 1,
          'Max_Occupancy': 2,
        }
        expectedIncomeLimits = [
          {
            'occupancy': 1,
            'maxIncome': '4671',
            'minIncome': '3400'
          },
          {
            'occupancy': 2,
            'maxIncome': '5338',
            'minIncome': '3400'
          }
        ]
        incomeLimits = ListingUnitService._getIncomeRangesByOccupancy(summary)
        expect(incomeLimits).toEqual(expectedIncomeLimits)

      it 'gets correct income range for units with min AMI', ->
        summary = {
          'BMR_Rental_Minimum_Monthly_Income_Needed': 0.00,
          'Max_AMI_for_Qualifying_Unit': 90,
          'Min_AMI_for_Qualifying_Unit': 65,
          'Planning_AMI_Tier': 'Moderate Income',
          'Min_Occupancy': 1,
          'Max_Occupancy': 3
        }
        expectedIncomeLimits = [
          {
            'occupancy': 1,
            'maxIncome': '6467',
            'minIncome': '4671'
          },
          {
            'occupancy': 2,
            'maxIncome': '7388',
            'minIncome': '5338'
          },
          {
            'occupancy': 3,
            'maxIncome': '8313',
            'minIncome': '6004'
          }
        ]
        incomeLimits = ListingUnitService._getIncomeRangesByOccupancy(summary)
        expect(incomeLimits).toEqual(expectedIncomeLimits)

      it 'gets correct income range for units without minimum income', ->
        summary = {
          'BMR_Rental_Minimum_Monthly_Income_Needed': 0,
          'Max_AMI_for_Qualifying_Unit': 55,
          'Min_Occupancy': 1,
          'Max_Occupancy': 3,
        }
        expectedIncomeLimits = [
          {
            'occupancy': 1,
            'maxIncome': '3800',
            'minIncome': '0'
          },
          {
            'occupancy': 2,
            'maxIncome': '4342',
            'minIncome': '0'
          },
          {
            'occupancy': 3,
            'maxIncome': '4883',
            'minIncome': '0'
          }
        ]
        incomeLimits = ListingUnitService._getIncomeRangesByOccupancy(summary)
        expect(incomeLimits).toEqual(expectedIncomeLimits)
      it 'fails gracefully if AMIs cannot be found', ->
        expect(true).toEqual(false)
      it 'assumes max occupancy if not provided', ->
        expect(true).toEqual(false)

    describe 'Service.getListingUnits', ->
      beforeEach ->
        requestURL = '/api/v1/listings/#{fakeListing.Id}/units'
        stubAngularAjaxRequest httpBackend, requestURL, fakeUnits
        ListingUnitService.getListingUnits(fakeListing)
        httpBackend.flush()
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'assigns the given listing.Units with the unit results', ->
        expect(fakeListing.Units).toEqual fakeUnits.units
      it 'assigns the given listing.groupedUnits with the grouped unit results', ->
        expect(fakeListing.groupedUnits).toEqual ListingUnitService.groupUnitDetails(fakeUnits.units)

    describe 'Service.listingHasOnlySROUnits', ->
      it 'returns false if not all units are SROs', ->
        fakeListing.unitSummaries.general[0].Unit_Type = 'Studio'
        expect(ListingUnitService.listingHasOnlySROUnits(fakeListing)).toEqual(false)
      it 'returns true if all units are SROs', ->
        expect(ListingUnitService.listingHasOnlySROUnits(fakeListingAllSRO)).toEqual(true)
