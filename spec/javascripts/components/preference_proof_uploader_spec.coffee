do ->
  'use strict'
  describe 'Preference Proof Uploader', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeFile = {
      name: 'filename.jpg'
      size: 3e6 # 3MB
    }
    fakeAddress = '123 Main St'
    fakeApplication =
      preferences:
        documents:
          rentBurden: {}
        optOut: {}
      groupedHouseholdAddresses: [
        {
          address: fakeAddress
          monthlyRent: 100
          members: []
        }
      ]
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeShortFormApplicationService = {
      listing: fakeListing
    }
    fakeSharedService = {}
    # set up default fake bindings
    fakeBindings =
      application: fakeApplication
      title: 'Preference'
      proofDocument: {}
    fakeFileUploadService =
      maxFileNameLength: 80
      maxFileSizeBytes: 2.5e7 # 25MB
      uploadProof: jasmine.createSpy()
      deleteFile: jasmine.createSpy()
    fakeShortFormHelperService =
      flagForI18n: (str) -> str
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_, $q) ->
      $componentController = _$componentController_
      $translate = {
        instant: jasmine.createSpy('$translate.instant').and.returnValue('newmessage')
      }
      deferred = $q.defer()
      locals =
        ShortFormApplicationService: fakeShortFormApplicationService
        FileUploadService: fakeFileUploadService
        ShortFormHelperService: fakeShortFormHelperService
        SharedService: fakeSharedService
        $translate: $translate
    )

    beforeEach ->
      ctrl = $componentController 'preferenceProofUploader', locals, fakeBindings

    describe 'validateFileNameLength', ->
      it 'should return true if file is OK', ->
        expect(ctrl.validateFileNameLength(fakeFile)).toEqual(true)

      it 'should return an error if file is missing', ->
        ctrl.validateFileNameLength(null)
        expect(fakeBindings.proofDocument.error).toEqual('error.file_missing')

      it 'should return an error if file is too big', ->
        tooBigFile = angular.copy(fakeFile)
        tooBigFile.size = fakeFileUploadService.maxFileSizeBytes + 1
        ctrl.validateFileNameLength(tooBigFile)
        expect(fakeBindings.proofDocument.error).toEqual('error.file_upload')

      it 'should return an error if file name is too long', ->
        tooLongNameFile = angular.copy(fakeFile)
        tooLongNameFile.name = _.repeat('a', fakeFileUploadService.maxFileNameLength + 1)
        ctrl.validateFileNameLength(tooLongNameFile)
        expect(fakeBindings.proofDocument.error).toEqual('error.file_name_too_long')
