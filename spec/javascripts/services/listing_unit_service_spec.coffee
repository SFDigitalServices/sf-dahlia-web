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

    beforeEach inject((_ListingUnitService_, _$httpBackend_) ->
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
        grouped = ListingUnitService.groupUnitDetails(fakeUnits.units)
        # fakeUnits just has one AMI level
        expect(_.keys(grouped).length).toEqual 1

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
