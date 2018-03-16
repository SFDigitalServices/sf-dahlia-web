do ->
  'use strict'
  describe 'FileUploadService', ->
    FileUploadService = undefined
    fakeShortFormApplicationService =
      preferences: {
        documents: {
          liveInSf: {}
        }
      }
    fakeListingPreference =
      listingPreferenceID: '123xyz'
    fakeListingService =
      getPreference: jasmine.createSpy().and.returnValue(fakeListingPreference)
      getPreferenceById: jasmine.createSpy().and.returnValue('1234')
    $translate = {}
    Upload =
      upload: ->
    uuid = {v4: jasmine.createSpy()}
    success = { success: true }
    httpBackend = undefined
    fakeFile = {name: 'img.jpg'}
    prefType = 'liveInSf'
    address = '123 Main St'

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value 'Upload', Upload
      $provide.value 'uuid', uuid
      $provide.value 'ListingService', fakeListingService
      return
    )

    beforeEach inject((_$httpBackend_, _FileUploadService_, _$q_) ->
      httpBackend = _$httpBackend_
      FileUploadService = _FileUploadService_
      FileUploadService.preferences = fakeShortFormApplicationService.preferences
      FileUploadService.session_uid = -> '123'
      $q = _$q_
      spyOn(Upload, 'upload').and.callFake ->
        deferred = $q.defer()
        deferred.resolve {data: fakeFile}
        deferred.promise
      return
    )

    describe 'Service setup', ->
      it 'initializes session_uid', ->
        expect(FileUploadService.session_uid).not.toEqual null

    describe 'Service.uploadProof', ->
      it 'returns a rejection if the listing does not have the preference identified by pref_type', ->
        bogusPrefType = 'foo'
        rejectedPromise = FileUploadService.uploadProof(fakeFile, bogusPrefType)
        rejectedPromiseResult = null
        rejectedPromise.then(
          () -> { rejectedPromiseResult = 'success' },
          () -> { rejectedPromiseResult = 'error' }
        )
        expect(rejectedPromiseResult).toEqual('error')

      it "returns a rejection if there's no file", ->
        rejectedPromise = FileUploadService.uploadProof(null, prefType)
        rejectedPromise.then(
          () -> { rejectedPromiseResult = 'success' },
          () -> { rejectedPromiseResult = 'error' }
        )
        expect(rejectedPromiseResult).toEqual('error')

      describe "setting the proofDocument's error to ERROR.FILE_MISSING if there's no file", ->
        describe 'when the rentBurdenType option is not present', ->
          beforeEach ->
            errorMsg = 'ERROR.FILE_MISSING'
            FileUploadService.preferences =
              documents:
                "#{prefType}":
                  file: "#{prefType}_file"
                rentBurden:
                  "#{address}":
                    lease: 'lease file'
                    rent:
                      1: 'rent file'

          it "sets the proofDocument's error to ERROR.FILE_MISSING if there's no file", ->
            FileUploadService.uploadProof(null, prefType)
            expect(FileUploadService.preferences.documents[prefType].error).toEqual(errorMsg)

        describe 'when the rentBurdenType option is present', ->
          opts =
            rentBurdenType: 'lease'
          FileUploadService.uploadProof(null, prefType)
          expect(FileUploadService.preferences.documents.rentBurden[address].error).toEqual(errorMsg)

      #sets the proofDocument's loading status to true
      #calls Service._processProofFile
      describe 'uploading a file >5MB', ->
        #sets the proofDocument's file to null
        #sets the proofDocument's loading status to false
        #sets the proofDocument's error to ERROR.FILE_UPLOAD

      describe 'uploading a file <=5MB', ->
        it 'calls Upload.upload function', ->
          FileUploadService.uploadProof(fakeFile, prefType)
          expect(Upload.upload).toHaveBeenCalled()

          describe 'successfully', ->
            #sets the proofDocument's file to the upload response data
            #sets the proofDocument's loading status to false
            #sets the proofDocument's error to false

          describe 'unsuccessfully', ->
            #sets the proofDocument's file to null
            #sets the proofDocument's loading status to false
            #sets the proofDocument's error to ERROR.FILE_UPLOAD_FAILED

    describe 'Service.deletePreferenceFile', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'unsets FileUploadService prefType_proof_file', ->
        stubAngularAjaxRequest httpBackend, '/api/v1/short-form/proof', success
        FileUploadService.preferences.documents[prefType].file = fakeFile
        FileUploadService.deletePreferenceFile(prefType)
        httpBackend.flush()
        expect(FileUploadService.preferences.documents[prefType].file).toEqual null

    describe 'Service.rentBurdenFile', ->
      beforeEach ->
        FileUploadService.preferences =
          documents:
            rentBurden:
              "#{address}":
                lease: 'lease file'
                rent:
                  1: 'rent file'
      describe 'lease file', ->
        it 'returns the correct lease file', ->
          opts =
            address: address
            rentBurdenType: 'lease'
          expect(FileUploadService.rentBurdenFile(opts)).toEqual('lease file')

      describe 'rent file', ->
        it 'returns the correct rent file', ->
          opts =
            address: address
            rentBurdenType: 'rent'
            index: 1
          expect(FileUploadService.rentBurdenFile(opts)).toEqual('rent file')

    describe 'Service.clearRentBurdenFile', ->
      beforeEach ->
        FileUploadService.preferences =
          documents:
            rentBurden:
              "#{address}":
                lease: {}

      it 'clears pertinent file', ->
        opts =
          address: address
          rentBurdenType: 'lease'
        FileUploadService.clearRentBurdenFile(opts)
        leaseFile = FileUploadService.preferences.documents.rentBurden[address].lease
        expect(leaseFile).toEqual {}

    describe 'Service.clearRentBurdenFiles', ->
      beforeEach ->
        FileUploadService.preferences =
          documents:
            rentBurden:
              "#{address}":
                lease: {file: 'some file'}
                rent:
                  1: {file: 'some file'}

      it 'clears all rent burden files', ->
        FileUploadService.clearRentBurdenFiles(address)
        rentBurdenFiles = FileUploadService.preferences.documents.rentBurden[address]
        expectedResult = { lease: {  }, rent: {  } }
        expect(rentBurdenFiles).toEqual expectedResult

    describe 'Service.hasRentBurdenFiles', ->
      beforeEach ->
        FileUploadService.preferences =
          documents:
            rentBurden:
              "#{address}":
                lease: {file: 'some file'}
                rent:
                  1: {file: 'some file'}

              '345 First St':
                lease: {}
                rent: {}

      it 'returns true if there are files, and no arguments given', ->
        hasFiles = FileUploadService.hasRentBurdenFiles()
        expect(hasFiles).toEqual true
      it 'returns true if there are files for the address given', ->
        hasFiles = FileUploadService.hasRentBurdenFiles(address)
        expect(hasFiles).toEqual true
      it 'returns false if there are not files for the address given', ->
        hasFiles = FileUploadService.hasRentBurdenFiles('345 First St')
        expect(hasFiles).toEqual false
      it 'returns false if there are no files at all', ->
        FileUploadService.clearRentBurdenFiles()
        hasFiles = FileUploadService.hasRentBurdenFiles()
        expect(hasFiles).toEqual false

    describe 'Service.deleteRentBurdenPreferenceFiles', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      beforeEach ->
        FileUploadService.preferences =
          documents:
            rentBurden:
              "#{address}":
                lease: {file: 'some file'}
                rent:
                  1: {file: 'some file'}

      it 'should delete all rent burden preference files', ->
        stubAngularAjaxRequest httpBackend, "/api/v1/short-form/proof", 200
        FileUploadService.deleteRentBurdenPreferenceFiles('listingID')
        httpBackend.flush()
        expectedResult = { lease: {  }, rent: {  } }
        rentBurdenFiles = FileUploadService.preferences.documents.rentBurden[address]
        expect(rentBurdenFiles).toEqual expectedResult
