do ->
  'use strict'
  describe 'File Uploader', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeFile = {
      name: 'filename.jpg'
      size: 3e6 # 3MB
    }
    fakeApplication = {}
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeShortFormApplicationService = {
      listing: fakeListing
    }
    fakeSharedService = {}
    # set up default fake bindings
    fakeBindings =
      application: fakeApplication
      buttonLabel: 'Preapproval Letter'
      fileLabel: 'Label'
      fileType: 'Loan pre-approval'
      document: {}
    fakeFileUploadService =
      maxFileNameLength: 80
      maxFileSizeBytes: 2.5e7 # 25MB
      uploadProof: jasmine.createSpy()
      deleteFile: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_, $q) ->
      $componentController = _$componentController_
      deferred = $q.defer()
      locals =
        ShortFormApplicationService: fakeShortFormApplicationService
        FileUploadService: fakeFileUploadService
        SharedService: fakeSharedService
    )

    beforeEach ->
      ctrl = $componentController 'fileUploader', locals, fakeBindings

    describe 'validateFile', ->
      it 'should return true if file is OK', ->
        expect(ctrl.validateFile(fakeFile)).toEqual(true)

      it 'should return an error if file is missing', ->
        ctrl.validateFile(null)
        expect(fakeBindings.document.error).toEqual('error.file_missing')

      it 'should return an error if file is too big', ->
        tooBigFile = angular.copy(fakeFile)
        tooBigFile.size = fakeFileUploadService.maxFileSizeBytes + 1
        ctrl.validateFile(tooBigFile)
        expect(fakeBindings.document.error).toEqual('error.file_upload')

      it 'should return an error if file name is too long', ->
        tooLongNameFile = angular.copy(fakeFile)
        tooLongNameFile.name = _.repeat('a', fakeFileUploadService.maxFileNameLength + 1)
        ctrl.validateFile(tooLongNameFile)
        expect(fakeBindings.document.error).toEqual('error.file_name_too_long')

    describe 'hasFile', ->
      it 'should return true if there is a file', ->
        fakeBindings.document.file = fakeFile
        expect(ctrl.hasFile()).toEqual(true)
      it 'should return false if there is no file', ->
        fakeBindings.document.file = null
        expect(ctrl.hasFile()).toEqual(false)

    describe 'uploadFile', ->
      it 'should call FileUploadService uploadProof', ->
        ctrl.uploadFile()
        expect(fakeFileUploadService.uploadProof).toHaveBeenCalled()

    describe 'deleteFile', ->
      it 'should call FileUploadService deleteFile', ->
        ctrl.deleteFile()
        expect(fakeFileUploadService.deleteFile).toHaveBeenCalled()
