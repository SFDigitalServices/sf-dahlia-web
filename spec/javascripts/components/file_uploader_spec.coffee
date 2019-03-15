do ->
  'use strict'
  describe 'File Uploader', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeFile = {
      name: 'filename.jpg'
      size: 3 * 1000 * 1000
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
      fileType: 'preapprovalLetter'
      document: {}
    fakeFileUploadService =
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
      it 'should return true is file is OK', ->
        expect(ctrl.validateFile(fakeFile)).toEqual(true)
      it 'should return an error if file is missing', ->
        ctrl.validateFile(null)
        expect(fakeBindings.document.error).toEqual('ERROR.FILE_MISSING')
      it 'should return an error if file is too big', ->
        fakeFile.size = 6 * 1000 * 1000
        ctrl.validateFile(fakeFile)
        expect(fakeBindings.document.error).toEqual('ERROR.FILE_UPLOAD')
      it 'should return an error if file name is too long', ->
        fakeFile.name = ""
        _.times(81, -> fakeFile.name += "a")
        ctrl.validateFile(fakeFile)
        expect(fakeBindings.document.error).toEqual('ERROR.FILE_NAME_TOO_LONG')

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