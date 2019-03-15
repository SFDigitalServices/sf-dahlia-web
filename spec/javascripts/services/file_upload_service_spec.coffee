do ->
  'use strict'
  describe 'FileUploadService', ->
    FileUploadService = undefined
    listingID = '1234'
    listingPreferenceID = '123xyz'
    fileValue = {name: 'img.jpg'}
    prefType = 'liveInSf'
    opts =
      prefType: prefType
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
    fakeDocument =
      proofOption: 'preapprovalLetter'
      file:
        name: "filename.png"
    fakeShortFormApplicationService =
      preferences:
        documents:
          "#{prefType}": {}
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
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'unsets FileUploadService prefType_proof_file', ->
        stubAngularAjaxRequest httpBackend, '/api/v1/short-form/proof', success
        FileUploadService.preferences.documents[prefType].file = file
        FileUploadService.deleteFile(fakeListing, opts)
        httpBackend.flush()
        expect(FileUploadService.preferences.documents[prefType].file).toEqual null

      it 'removes file for document without preference', ->
        stubAngularAjaxRequest httpBackend, '/api/v1/short-form/proof', success
        opts =
          document: fakeDocument
        FileUploadService.deleteFile(fakeListing, opts)
        httpBackend.flush()
        expect(fakeDocument.file).toEqual null

    describe 'Service.uploadProof', ->
      beforeEach ->
        proofDocument = FileUploadService.preferences.documents[prefType]
        # FileUploadService._proofDocument = jasmine.createSpy().and.returnValue(proofDocument)
        FileUploadService._processProofFile = jasmine.createSpy()
        opts =
          prefType: prefType

      describe 'when preference is not found on the listing', ->
        beforeEach ->
          fakeListingPreferenceService.getPreferenceById = jasmine.createSpy().and.returnValue(null)

        afterEach ->
          fakeListingPreferenceService.getPreferenceById = jasmine.createSpy().and.returnValue(listingPreferenceID)

        it 'returns a rejection', ->
          rejection = FileUploadService.uploadProof(file, fakeListing, opts)

          promiseResult = null
          deferred = $q.defer()
          deferred.promise.then(
            -> promiseResult = 'success',
            -> promiseResult = 'error'
          )
          deferred.resolve(rejection)
          # please see https://docs.angularjs.org/api/ng/service/$q#testing
          # to understand why the below line is required
          $rootScope.$apply()

          expect(promiseResult).toEqual('error')

      describe 'when file is empty', ->
        beforeEach ->
          file = null
          errorMsg = 'ERROR.FILE_MISSING'
          opts =
            prefType: prefType

        afterEach ->
          file = fileValue
          errorMsg = undefined
          FileUploadService.preferences = fakeShortFormApplicationService.preferences

        it 'returns a rejection', ->
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
        beforeEach ->
          file = fileValue
          opts =
            prefType: prefType

        it "sets the proof document's loading to true", ->
          FileUploadService.uploadProof(file, fakeListing, opts)
          expect(proofDocument.loading).toEqual(true)

          describe 'when the rentBurdenType option is not present', ->
            it 'calls Service._processProofFile with the correct non-rent-burdened params', ->
              uploadedFileParams =
                session_uid: FileUploadService.session_uid()
                listing_id: fakeListing.Id
                listing_preference_id: listingPreferenceID
                document_type: proofDocument.proofOption
              FileUploadService.uploadProof(file, fakeListing, opts)
              expect(FileUploadService._processProofFile).toHaveBeenCalledWith(file, proofDocument, uploadedFileParams)

          describe 'when the rentBurdenType option is present', ->
            it 'calls Service._processProofFile with the correct rent burdened params', ->
              opts =
                rentBurdenType: 'lease'
                address: address1
                index: 1
                prefType: prefType

              uploadedFileParams =
                session_uid: FileUploadService.session_uid()
                listing_id: fakeListing.Id
                listing_preference_id: listingPreferenceID
                document_type: proofDocument.proofOption
                address: opts.address
                rent_burden_type: opts.rentBurdenType
                rent_burden_index: opts.index

              FileUploadService.uploadProof(file, fakeListing, opts)
              expect(FileUploadService._processProofFile).toHaveBeenCalledWith(file, proofDocument, uploadedFileParams)
        describe "when document is provided", ->
          it 'removes file for document without preference', ->
            fakeDocument.file = null
            fakeDocument.loading = true
            opts =
              document: fakeDocument
            uploadedFileParams =
              session_uid: FileUploadService.session_uid()
              listing_id: fakeListing.Id
              listing_preference_id: undefined
              document_type: fakeDocument.proofOption
            FileUploadService.uploadProof(file, fakeListing, opts)
            expect(FileUploadService._processProofFile).toHaveBeenCalledWith(file, fakeDocument, uploadedFileParams)

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

      describe 'when file is larger than 5MB', ->
        beforeEach ->
          file =
            size: (5 * 1000 * 1000) + 1
          uploadedFileParams = {}
          errorMsg = 'ERROR.FILE_UPLOAD'
          FileUploadService._uploadProofFile(file, proofDocument, uploadedFileParams)

        it "sets the proofDocument's file to null", ->
          expect(proofDocument.file).toEqual(null)

        it "sets the proofDocument's loading status to false", ->
          expect(proofDocument.loading).toEqual(false)

        it "sets the proofDocument's error to ERROR.FILE_UPLOAD", ->
          expect(proofDocument.error).toEqual(errorMsg)

      describe 'when file is equal to or less than than 5MB', ->
        beforeEach ->
          file =
            size: 5 * 1000 * 1000

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
            errorMsg = 'ERROR.FILE_UPLOAD_FAILED'
            FileUploadService._uploadProofFile(file, proofDocument, uploadedFileParams)
            $rootScope.$apply()

          it "sets the proofDocument's file to null", ->
            expect(proofDocument.file).toEqual(null)

          it "sets the proofDocument's loading status to false", ->
            expect(proofDocument.loading).toEqual(false)

          it "sets the proofDocument's error to ERROR.FILE_UPLOAD_FAILED", ->
            expect(proofDocument.error).toEqual(errorMsg)
