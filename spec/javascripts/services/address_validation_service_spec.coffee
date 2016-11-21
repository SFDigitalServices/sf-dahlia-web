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
    fakeInvalidAddress =
      address1: '123123 Blah'
      city: 'San Francisco'
      state: 'CA'
      zip: '12345'
    fakeValidResult = getJSONFixture('address-validation-api-valid-address.json')
    fakeInvalidResult = getJSONFixture('address-validation-api-invalid-address.json')

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

      it 'initializes defaults', ->
        expect(AddressValidationService.validated_home_address).toEqual {}

    describe 'Service.validate', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'assigns validated address with results from validation service', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeValidResult
        AddressValidationService.validate({
          address: fakeAddress
          type: 'home'
        })
        httpBackend.flush()
        expect(AddressValidationService.validated_home_address).toEqual fakeValidResult.address

      it 'determines if valid address is deliverable', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeValidResult
        AddressValidationService.validate({
          address: fakeAddress
          type: 'home'
        })
        httpBackend.flush()
        result = AddressValidationService.isDeliverable(AddressValidationService.validated_home_address)
        expect(result).toEqual true

      it 'determines if invalid address failed validation', ->
        stubAngularAjaxErrorRequest httpBackend, requestURL, fakeInvalidResult
        AddressValidationService.validate({
          address: fakeInvalidAddress
          type: 'home'
        })
        httpBackend.flush()
        result = AddressValidationService.failedValidation(AddressValidationService.validated_home_address)
        expect(result).toEqual true
