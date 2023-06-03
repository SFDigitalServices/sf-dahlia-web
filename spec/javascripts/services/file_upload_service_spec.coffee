do ->
  'use strict'
  describe 'FileUploadService', ->
    FileUploadService = undefined
    listingID = '1234'
    listingPreferenceID = '123xyz'
    fileValue = {name: 'img.jpg'}
    prefType = 'liveInSf'

    opts = {}
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
    fakeDocumentTemplate =
      proofOption: 'Loan pre-approval'
      file:
        name: "filename.png"
    fakeDocument = null
    fakeShortFormApplicationService =
      preferences:
        documents:
          "#{prefType}": {}
    fakeRentBurdenFileService =
      clearRentBurdenFile: jasmine.createSpy()
    fakeShortFormHelperService =
      flagForI18n: (str) -> str
    $translate = {}
    Upload =
      upload: ->
    uuid = {v4: jasmine.createSpy()}
    success = { success: true }
    httpBackend = undefined
    $q = undefined
    $rootScope = undefined

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value 'Upload', Upload
      $provide.value 'uuid', uuid
      $provide.value 'ListingPreferenceService', fakeListingPreferenceService
      $provide.value 'RentBurdenFileService', fakeRentBurdenFileService
      $provide.value 'ShortFormHelperService', fakeShortFormHelperService
      return
    )

    beforeEach inject((_$httpBackend_, _FileUploadService_, _$q_, _$rootScope_) ->
      httpBackend = _$httpBackend_
      FileUploadService = _FileUploadService_
      FileUploadService.preferences = fakeShortFormApplicationService.preferences
      FileUploadService.session_uid = -> '123'
      $q = _$q_
      $rootScope = _$rootScope_
      return
    )

    describe 'Service setup', ->
      it 'initializes session_uid', ->
        expect(FileUploadService.session_uid).not.toEqual null

    describe 'Service.deleteFile', ->
      beforeEach ->
        fakeDocument = angular.copy(fakeDocumentTemplate)
        FileUploadService._proofDocument = jasmine.createSpy()
          .and.returnValue(fakeDocument)
        FileUploadService._uploadedFileParams = jasmine.createSpy()
          .and.returnValue({uploaded_file: {id: 1}})
        stubAngularAjaxRequest httpBackend, '/api/v1/short-form/proof', success

      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      describe 'when opts.rentBurdenType is present', ->
        it 'clears the file from Service.preferences\'s rent burden files', ->
          opts =
            rentBurdenType: 'lease'
          FileUploadService.deleteFile(fakeListing, opts)
          httpBackend.flush()
          expect(fakeRentBurdenFileService.clearRentBurdenFile).toHaveBeenCalledWith(
            opts,
            FileUploadService.preferences
          )

      describe 'when opts.rentBurdenType is not present', ->
        beforeEach ->
          opts = {}
          FileUploadService.deleteFile(fakeListing, opts)
          httpBackend.flush()

        it 'removes the file from the document', ->
          expect(fakeDocument.file).toEqual null

        it 'removes the proofOption from the document', ->
          expect(fakeDocument.proofOption).toEqual null

    describe 'Service.uploadProof', ->
      beforeEach ->
        fakeDocument = angular.copy(fakeDocumentTemplate)
        file = angular.copy(fileValue)
        FileUploadService._proofDocument = jasmine.createSpy().and.returnValue(fakeDocument)
        FileUploadService._processProofFile = jasmine.createSpy()
        FileUploadService._uploadedFileParams = jasmine.createSpy()
          .and.returnValue({uploaded_file: {id: 1}})
        opts =
          prefType: prefType

      describe 'when file is empty', ->
        afterEach ->
          errorMsg = undefined

        it 'returns a rejection', ->
          file = null
          errorMsg = 'error.file_missing'

          rejection = FileUploadService.uploadProof(file, fakeListing, opts)

          promiseResult = null
          deferred = $q.defer()
          deferred.promise.then(
            -> promiseResult = 'success',
            -> promiseResult = 'error'
          )
          deferred.resolve(rejection)
          $rootScope.$apply()

          expect(promiseResult).toEqual('error')

      describe 'when proof document is not found', ->
        it 'returns a rejection', ->
          FileUploadService._proofDocument.and.returnValue(null)
          rejection = FileUploadService.uploadProof(file, fakeListing, opts)

          promiseResult = null
          deferred = $q.defer()
          deferred.promise.then(
            -> promiseResult = 'success',
            -> promiseResult = 'error'
          )
          deferred.resolve(rejection)
          $rootScope.$apply()

          expect(promiseResult).toEqual('error')

      describe 'when file is present', ->
        it "sets the proof document's loading to true", ->
          FileUploadService.uploadProof(file, fakeListing, opts)
          expect(fakeDocument.loading).toEqual(true)

        describe 'when the rentBurdenType option is not present', ->
          it 'calls Service._processProofFile with the correct non-rent-burdened params', ->
            uploadedFileParams = {uploaded_file: {id: 2}}
            FileUploadService._uploadedFileParams.and.returnValue(uploadedFileParams)
            FileUploadService.uploadProof(file, fakeListing, opts)
            expect(FileUploadService._processProofFile).toHaveBeenCalledWith(
              file,
              fakeDocument,
              uploadedFileParams.uploaded_file
            )

        describe 'when the rentBurdenType option is present', ->
          it 'calls Service._processProofFile with the correct rent burdened params', ->
            opts =
              rentBurdenType: 'lease'
            uploadedFileParams = {uploaded_file: {id: 3}}
            FileUploadService._uploadedFileParams.and.returnValue(uploadedFileParams)

            FileUploadService.uploadProof(file, fakeListing, opts)
            expect(FileUploadService._processProofFile).toHaveBeenCalledWith(
              file,
              fakeDocument,
              uploadedFileParams.uploaded_file
            )

    describe 'Service._proofDocument', ->
      beforeEach ->
        FileUploadService.preferences =
          documents:
            "#{prefType}": "#{prefType}_file"
            rentBurden:
              "#{address1}":
                lease: 'address1 lease file'
                rent:
                  1: 'address1 rent file'
              "#{address2}":
                lease: 'address2 lease file'
                rent:
                  1: 'address2 rent file'

      describe 'non-rent-burdened file', ->
        it 'returns the correct non-rent-burdened file', ->
          opts =
            prefType: prefType
          expect(FileUploadService._proofDocument(fakeListing, opts)).toEqual("#{prefType}_file")

      describe 'rent burdened lease file', ->
        it 'returns the correct lease file', ->
          opts =
            address: address1
            rentBurdenType: 'lease'
            prefType: prefType
          expect(FileUploadService._proofDocument(fakeListing, opts)).toEqual('address1 lease file')

      describe 'rent burdened rent file', ->
        it 'returns the correct rent file', ->
          opts =
            address: address2
            rentBurdenType: 'rent'
            index: 1
            prefType: prefType
          expect(FileUploadService._proofDocument(fakeListing, opts)).toEqual('address2 rent file')

    describe 'Service._uploadProofFile', ->
      beforeEach ->
        FileUploadService.preferences =
          documents:
            "#{prefType}":
              file: "#{prefType}_file"
            rentBurden:
              "#{address1}":
                lease: 'lease file'
                rent:
                  1: 'rent file'
        proofDocument = FileUploadService.preferences.documents[prefType]

      describe 'when file is larger than 25MB', ->
        beforeEach ->
          file =
            size: (2.5e7) + 1
          uploadedFileParams = {}
          errorMsg = 'error.file_upload'
          FileUploadService._uploadProofFile(file, proofDocument, uploadedFileParams)

        it "sets the proofDocument's file to null", ->
          expect(proofDocument.file).toEqual(null)

        it "sets the proofDocument's loading status to false", ->
          expect(proofDocument.loading).toEqual(false)

        it "sets the proofDocument's error to ERROR.FILE_UPLOAD", ->
          expect(proofDocument.error).toEqual(errorMsg)

      describe 'when file is equal to or less than than 25MB', ->
        beforeEach ->
          file =
            size: 2.5e7

        it 'calls Upload.upload with the correct params', ->
          Upload.upload = jasmine.createSpy().and.callFake ->
            deferred = $q.defer()
            deferred.resolve {data: 'foo'}
            deferred.promise

          uploadedFileParams = {file: file}
          params =
            url: '/api/v1/short-form/proof'
            method: 'POST'
            data:
              uploaded_file: uploadedFileParams

          FileUploadService._uploadProofFile(file, proofDocument, uploadedFileParams)
          expect(Upload.upload).toHaveBeenCalledWith(params)

        describe 'when the upload succeeds', ->
          beforeEach ->
            uploadedFileParams = {}
            Upload.upload = jasmine.createSpy().and.callFake ->
              deferred = $q.defer()
              deferred.resolve {data: 'foo'}
              deferred.promise
            FileUploadService._uploadProofFile(file, proofDocument, uploadedFileParams)
            $rootScope.$apply()

          it "sets the proofDocument's file to the response data", ->
            expect(proofDocument.file).toEqual('foo')

          it "sets the proofDocument's loading status to false", ->
            expect(proofDocument.loading).toEqual(false)

          it "sets the proofDocument's error to false", ->
            expect(proofDocument.error).toEqual(false)

        describe 'when the upload fails', ->
          beforeEach ->
            uploadedFileParams = {}
            Upload.upload = jasmine.createSpy().and.callFake ->
              $q.reject()
            errorMsg = 'error.file_upload_failed'
            FileUploadService._uploadProofFile(file, proofDocument, uploadedFileParams)
            $rootScope.$apply()

          it "sets the proofDocument's file to null", ->
            expect(proofDocument.file).toEqual(null)

          it "sets the proofDocument's loading status to false", ->
            expect(proofDocument.loading).toEqual(false)

          it "sets the proofDocument's error to ERROR.FILE_UPLOAD_FAILED", ->
            expect(proofDocument.error).toEqual(errorMsg)
