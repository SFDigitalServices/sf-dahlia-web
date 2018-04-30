do ->
  'use strict'
  describe 'GeocodingService', ->
    GeocodingService = undefined
    httpBackend = undefined
    fakeShortFormDataService =
      formatUserDOB: ->
    fakeValidAddressMatchResult = getJSONFixture('geocoding-api-valid-address-boundary-match.json')
    fakeValidAddressNoMatchResult = getJSONFixture('geocoding-api-valid-address-no-boundary-match.json')
    fakeInvalidResult = getJSONFixture('geocoding-api-invalid-address.json')
    requestURL = undefined
    fakeListing = getJSONFixture('listings-api-show.json')
    fakeAddress =
      address1: '4053 18th st'
      city: 'San Francisco'
      state: 'CA'
      zip: '94114'
    fakeApplicant =
      firstName: 'Bob'
      lastName: 'Williams'
      dob_month: '07'
      dob_day: '05'
      dob_year: '2015'
      preferences: {liveInSf: null, workInSf: null}
    fakeHouseholdMember =
      firstName: 'Ethel'
      lastName: 'O\'Keefe'
      dob_month: '09'
      dob_day: '27'
      dob_year: '1966'
    geocodeOptions =
      address: fakeAddress
      listing: fakeListing
      member: fakeHouseholdMember
      applicant: fakeApplicant
      nrhp: true
      adhp: true

    beforeEach module('ui.router')
    beforeEach module('dahlia.services', ($provide)->
      $provide.value 'ShortFormDataService', fakeShortFormDataService
      return
    )

    beforeEach inject((_GeocodingService_, _$httpBackend_) ->
      httpBackend = _$httpBackend_
      GeocodingService = _GeocodingService_
      return
    )

    describe 'geocode', ->
      describe 'when the attempt to geocode is successful', ->
        afterEach ->
          httpBackend.verifyNoOutstandingExpectation()
          httpBackend.verifyNoOutstandingRequest()

        describe 'when the address is a match', ->
          it 'sets Service.preferenceAddressMatch to "Matched"', ->
            stubAngularAjaxRequest httpBackend, requestURL, fakeValidAddressMatchResult
            GeocodingService.geocode(geocodeOptions)
            httpBackend.flush()
            expect(GeocodingService.preferenceAddressMatch).toEqual 'Matched'

        describe 'when the address is not a match', ->
          it 'sets Service.preferenceAddressMatch to "Not Matched"', ->
            stubAngularAjaxRequest httpBackend, requestURL, fakeValidAddressNoMatchResult
            GeocodingService.geocode(geocodeOptions)
            httpBackend.flush()
            expect(GeocodingService.preferenceAddressMatch).toEqual "Not Matched"

        describe 'when the address is invalid', ->
          it 'sets Service.preferenceAddressMatch to be blank', ->
            stubAngularAjaxRequest httpBackend, requestURL, fakeInvalidResult
            GeocodingService.geocode(geocodeOptions)
            httpBackend.flush()
            expect(GeocodingService.preferenceAddressMatch).toEqual ''

      describe 'when the attempt to geocode encounters an error', ->
        afterEach ->
          httpBackend.verifyNoOutstandingExpectation()
          httpBackend.verifyNoOutstandingRequest()

        it 'sets Service.preferenceAddressMatch to be blank', ->
          stubAngularAjaxErrorRequest httpBackend, requestURL, {}
          GeocodingService.geocode(geocodeOptions)
          httpBackend.flush()
          expect(GeocodingService.preferenceAddressMatch).toEqual ''
