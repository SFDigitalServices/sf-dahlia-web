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
    fakePOBoxAddress =
      address1: 'P.O. Box 37176'
      city: 'San Francisco'
      state: 'CA'
      zip: '94137'
    fakeValidResult = getJSONFixture('address-validation-api-valid-address.json')
    fakePOBoxResult = getJSONFixture('address-validation-api-valid-po-box.json')

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

      it 'determines if PO box address failed validation', ->
        stubAngularAjaxErrorRequest httpBackend, requestURL, fakePOBoxResult
        AddressValidationService.validate({
          address: fakePOBoxAddress
          type: 'home'
        })
        httpBackend.flush()
        result = AddressValidationService.validationError(AddressValidationService.validated_home_address)
        expect(result).toEqual 'PO BOX'
