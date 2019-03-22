do ->
  'use strict'
  describe 'RentBurdenFileService', ->
    RentBurdenFileService = undefined
    listingID = '1234'
    listingPreferenceID = '123xyz'
    fileValue = {name: 'img.jpg'}
    prefType = 'liveInSf'
    address1 = '123 Main St'
    address2 = '345 First St'
    errorMsg = undefined
    proofDocument = undefined
    file = fileValue
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeListingPreference =
      listingPreferenceID: listingPreferenceID
    fakeListingPreferenceService = {
      getPreference: jasmine.createSpy().and.returnValue(fakeListingPreference)
      getPreferenceById: jasmine.createSpy().and.returnValue(true)
    }
    fakeShortFormApplicationService =
      preferences:
        documents:
          "#{prefType}": {}
    fakeListingDataService =
      listing: fakeListing
    $translate = {}
    uuid = {v4: jasmine.createSpy()}
    success = { success: true }
    httpBackend = undefined
    $q = undefined
    $rootScope = undefined

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value 'uuid', uuid
      $provide.value 'ListingDataService', fakeListingDataService
      $provide.value 'ListingPreferenceService', fakeListingPreferenceService
      return
    )

    beforeEach inject((_$httpBackend_, _RentBurdenFileService_, _$q_, _$rootScope_) ->
      httpBackend = _$httpBackend_
      RentBurdenFileService = _RentBurdenFileService_
      RentBurdenFileService.preferences = fakeShortFormApplicationService.preferences
      RentBurdenFileService.session_uid = -> '123'
      $q = _$q_
      $rootScope = _$rootScope_
      return
    )

    describe 'Service.uploadedRentBurdenRentFiles', ->
      beforeEach ->
        RentBurdenFileService.preferences =
          documents:
            rentBurden:
              "#{address1}":
                lease: {file: 'address1 lease file'}
                rent:
                  1: {file: 'address1 rent file 1'}
                  2: {file: 'address1 rent file 2'}
                  3: {}
              "#{address2}":
                lease: {}
                rent: {}

      it 'returns the non-empty rent burdened rent files for the given address', ->
        files = [
          {file: 'address1 rent file 1'},
          {file: 'address1 rent file 2'}
        ]
        expect(RentBurdenFileService.uploadedRentBurdenRentFiles(address1)).toEqual(files)

      it 'returns an empty list if no rent burdened rent files are found for the given address', ->
        files = []
        expect(RentBurdenFileService.uploadedRentBurdenRentFiles(address2)).toEqual(files)

    describe 'Service.hasRentBurdenFiles', ->
      beforeEach ->
        RentBurdenFileService.preferences =
          documents:
            rentBurden:
              "#{address1}":
                lease: {file: 'address1 lease file'}
                rent:
                  1: {file: 'address1 rent file'}
              "#{address2}":
                lease: {}
                rent: {}

      it 'returns true if there are files, and no arguments given', ->
        hasFiles = RentBurdenFileService.hasRentBurdenFiles()
        expect(hasFiles).toEqual true

      it 'returns true if there are files for the address given', ->
        hasFiles = RentBurdenFileService.hasRentBurdenFiles(address1)
        expect(hasFiles).toEqual true

      it 'returns false if there are not files for the address given', ->
        hasFiles = RentBurdenFileService.hasRentBurdenFiles(address2)
        expect(hasFiles).toEqual false

      it 'returns false if there are no files at all', ->
        RentBurdenFileService.clearRentBurdenFiles()
        hasFiles = RentBurdenFileService.hasRentBurdenFiles()
        expect(hasFiles).toEqual false

    describe 'Service.clearRentBurdenFile', ->
      beforeEach ->
        RentBurdenFileService.preferences =
          documents:
            rentBurden:
              "#{address1}":
                lease: {}

      it 'clears pertinent file', ->
        opts =
          address: address1
          rentBurdenType: 'lease'
        RentBurdenFileService.clearRentBurdenFile(opts)
        leaseFile = RentBurdenFileService.preferences.documents.rentBurden[address1].lease
        expect(leaseFile).toEqual {}

    describe 'Service.clearRentBurdenFiles', ->
      beforeEach ->
        RentBurdenFileService.preferences =
          documents:
            rentBurden:
              "#{address1}":
                lease: {file: 'some file'}
                rent:
                  1: {file: 'some file'}

      it 'clears all rent burdened files', ->
        RentBurdenFileService.clearRentBurdenFiles(address1)
        rentBurdenFiles = RentBurdenFileService.preferences.documents.rentBurden[address1]
        expectedResult = { lease: {  }, rent: {  } }
        expect(rentBurdenFiles).toEqual expectedResult

    describe 'Service.deleteRentBurdenPreferenceFiles', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      beforeEach ->
        RentBurdenFileService.preferences =
          documents:
            rentBurden:
              "#{address1}":
                lease: {file: 'some file'}
                rent:
                  1: {file: 'some file'}

      it 'should delete all rent burdened preference files', ->
        stubAngularAjaxRequest httpBackend, "/api/v1/short-form/proof", 200
        RentBurdenFileService.deleteRentBurdenPreferenceFiles('listingID')
        httpBackend.flush()
        expectedResult = { lease: {  }, rent: {  } }
        rentBurdenFiles = RentBurdenFileService.preferences.documents.rentBurden[address1]
        expect(rentBurdenFiles).toEqual expectedResult