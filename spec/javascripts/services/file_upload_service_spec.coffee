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
    $translate = {}
    Upload =
      upload: ->
    uuid = {v4: jasmine.createSpy()}
    success = { success: true }
    httpBackend = undefined
    fakeFile = {name: 'img.jpg'}
    prefType = 'liveInSf'

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value 'Upload', Upload
      $provide.value 'uuid', uuid
      $provide.value 'ShortFormApplicationService', fakeShortFormApplicationService
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
      it 'calls Upload.upload function', ->

        FileUploadService.uploadProof(fakeFile, prefType)
        expect(Upload.upload).toHaveBeenCalled()

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
