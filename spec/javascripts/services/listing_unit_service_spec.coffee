do ->
  'use strict'
  describe 'ListingUnitService', ->
    ListingUnitService = undefined
    httpBackend = undefined
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeUnits = getJSONFixture('listings-api-units.json')
    # fakeListingAllSRO has only one unit summary, in general, for SRO
    fakeListingAllSRO = angular.copy(fakeListing)
    fakeListingAllSRO.unitSummaries =
      reserved: null
      general: [angular.copy(fakeListing.unitSummaries.general[0])]
    fakeListingAllSRO.unitSummaries.general[0].unitType = 'SRO'
    fakeListingAllSRO.unitSummaries.general[0].maxOccupancy = 1

    beforeEach module('dahlia.services', ($provide) ->
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

    describe 'Service.groupUnitDetails', ->
      it 'should return an object containing a list of units for each AMI level', ->
        fakeUnitsMultiAMI = {'units': [angular.copy(fakeUnits.units[0]), angular.copy(fakeUnits.units[0])]}
        fakeUnitsMultiAMI.units[1]['of_AMI_for_Pricing_Unit'] = 40
        grouped = ListingUnitService.groupUnitDetails(fakeUnitsMultiAMI.units)

        expect(_.keys(grouped).length).toEqual 2
      it 'should group units by unit Type within AMI levels', ->
        fakeUnitsMultiType = {'units': [angular.copy(fakeUnits.units[0]), angular.copy(fakeUnits.units[0])]}
        fakeUnitsMultiType.units[1]['Unit_Type'] = '2 BR'
        grouped = ListingUnitService.groupUnitDetails(fakeUnitsMultiType.units)

        expect(_.keys(grouped[100])).toEqual ['1 BR', '2 BR']
    describe 'Service._sumSimilarUnits', ->
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

    describe 'Service.getListingUnits', ->
      beforeEach ->
        requestURL = "/api/v1/listings/#{fakeListing.Id}/units"
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
