do ->
  'use strict'
  describe 'ListingUnitService', ->

    ListingUnitService = undefined
    httpBackend = undefined
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeUnits = getJSONFixture('listings-api-units.json')

    beforeEach module('dahlia.services', ($provide) ->
      return
    )

    beforeEach inject((_ListingUnitService_, _$httpBackend_) ->
      httpBackend = _$httpBackend_
      ListingUnitService = _ListingUnitService_
      requestURL = ListingUnitService.requestURL
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
        stubAngularAjaxRequest httpBackend, requestURL, fakeUnits
        spyOn()
        ListingUnitService.getListingUnits(fakeListing)
        httpBackend.flush()
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'assigns the given listing.Units with the unit results', ->
        expect(fakeListing.Units).toEqual fakeUnits.units
      it 'assigns the given listing.groupedUnits with the grouped unit results', ->
        expect(fakeListing.groupedUnits).toEqual ListingUnitService.groupUnitDetails(fakeUnits.units)
