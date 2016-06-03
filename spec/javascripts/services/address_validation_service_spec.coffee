do ->
  'use strict'
  describe 'AddressValidationService', ->

    AddressValidationService = undefined
    httpBackend = undefined
    fakeAddress =
      address1: '4053 18th st'
      city: 'San Francisco'
      state: 'CA'
      zip: '94114'
    # fakeListings = getJSONFixture('listings-api-index.json')
    # TODO: create actual json fixture
    fakeValidation =
      address:
        street1: 'fake'
    requestURL = undefined

    beforeEach module('dahlia.services', ->
    )

    beforeEach inject((_$httpBackend_, _AddressValidationService_) ->
      httpBackend = _$httpBackend_
      AddressValidationService = _AddressValidationService_
      requestURL = AddressValidationService.requestURL
      return
    )

    describe 'Service setup', ->
      it 'initializes defaults', ->
        expect(AddressValidationService.validated_mailing_address).toEqual {}
        return
      return
      it 'initializes defaults', ->
        expect(AddressValidationService.validated_home_address).toEqual {}
        return
      return

    describe 'Service.validate', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
        return
      it 'assigns validated address with results from validation service', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeValidation
        AddressValidationService.validate({
          address: fakeAddress
          type: 'home'
        })
        httpBackend.flush()
        expect(AddressValidationService.validated_home_address).toEqual fakeValidation.address
        return
      return

  return
