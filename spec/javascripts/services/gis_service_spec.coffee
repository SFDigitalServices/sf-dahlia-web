do ->
  'use strict'
  describe 'GISService', ->
    GISService = undefined
    httpBackend = undefined
    $q = undefined
    $rootScope = undefined
    fakeShortFormDataService =
      formatUserDOB: ->
    fakeValidAddressMatchResult = getJSONFixture('gis-api-valid-address-boundary-match.json')
    fakeValidAddressNoMatchResult = getJSONFixture('gis-api-valid-address-no-boundary-match.json')
    fakeInvalidResult = getJSONFixture('gis-api-invalid-address.json')
    requestURL = undefined
    fakeListing = getJSONFixture('listings-api-show.json')
    fakeAddress =
      address1: '4053 18th St'
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
    gisDataOptions =
      address: fakeAddress
      listing: fakeListing
      member: fakeHouseholdMember
      applicant: fakeApplicant
      project_id: fakeListing.Project_ID

    beforeEach module('ui.router')
    beforeEach module('dahlia.services', ($provide)->
      $provide.value 'ShortFormDataService', fakeShortFormDataService
      return
    )

    beforeEach inject((_GISService_, _$httpBackend_, _$q_, _$rootScope_) ->
      httpBackend = _$httpBackend_
      GISService = _GISService_
      $q = _$q_
      $rootScope = _$rootScope_
      return
    )

    describe 'getGISData', ->
      describe 'when the attempt to get GIS data is successful', ->
        afterEach ->
          httpBackend.verifyNoOutstandingExpectation()
          httpBackend.verifyNoOutstandingRequest()

        it 'returns a successful promise whose value contains valid geocoded address information', ->
          stubAngularAjaxRequest httpBackend, requestURL, fakeValidAddressMatchResult
          promise = GISService.getGISData(gisDataOptions)
          httpBackend.flush()

          result = getPromiseResult($rootScope, $q, promise)
          expect(result.status).toEqual 'success'
          expect(result.value.gis_data.score).toEqual 100

        describe 'when a project ID is sent', ->
          afterEach ->
            httpBackend.verifyNoOutstandingExpectation()
            httpBackend.verifyNoOutstandingRequest()

          describe 'when the address is a match', ->
            it 'returns a successful promise whose value contains a true boundary match', ->
              stubAngularAjaxRequest httpBackend, requestURL, fakeValidAddressMatchResult
              promise = GISService.getGISData(gisDataOptions)
              httpBackend.flush()

              result = getPromiseResult($rootScope, $q, promise)
              expect(result.status).toEqual 'success'
              expect(result.value.gis_data.boundary_match).toEqual true

          describe 'when the address is not a match', ->
            it 'returns a successful promise whose value contains a false boundary match', ->
              stubAngularAjaxRequest httpBackend, requestURL, fakeValidAddressNoMatchResult
              promise = GISService.getGISData(gisDataOptions)
              httpBackend.flush()

              result = getPromiseResult($rootScope, $q, promise)
              expect(result.status).toEqual 'success'
              expect(result.value.gis_data.boundary_match).toEqual false

          describe 'when the address is invalid', ->
            it 'returns a successful promise whose value contains a null boundary match', ->
              stubAngularAjaxRequest httpBackend, requestURL, fakeInvalidResult
              promise = GISService.getGISData(gisDataOptions)
              httpBackend.flush()

              result = getPromiseResult($rootScope, $q, promise)
              expect(result.status).toEqual 'success'
              expect(result.value.gis_data.boundary_match).toEqual null

        describe 'when no project ID is sent', ->
          afterEach ->
            httpBackend.verifyNoOutstandingExpectation()
            httpBackend.verifyNoOutstandingRequest()

          it 'returns a successful promise whose value contains a null boundary match', ->
            stubAngularAjaxRequest httpBackend, requestURL, fakeInvalidResult
            gisDataOptions.project_id = null
            promise = GISService.getGISData(gisDataOptions)
            httpBackend.flush()

            result = getPromiseResult($rootScope, $q, promise)
            expect(result.status).toEqual 'success'
            expect(result.value.gis_data.boundary_match).toEqual null

      describe 'when the attempt to get GIS data encounters an error', ->
        afterEach ->
          httpBackend.verifyNoOutstandingExpectation()
          httpBackend.verifyNoOutstandingRequest()

        it 'returns a failed promise whose value contains a null boundary match', ->
          stubAngularAjaxErrorRequest httpBackend, requestURL, {}
          promise = GISService.getGISData(gisDataOptions)
          httpBackend.flush()

          result = getPromiseResult($rootScope, $q, promise)
          expect(result.status).toEqual 'error'
          expect(result.value.gis_data.boundary_match).toEqual null
