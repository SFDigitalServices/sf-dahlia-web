do ->
  'use strict'
  describe 'Rent Burden Preference Dashboard', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
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
    fakeShortFormApplicationService =
      hasCompleteRentBurdenFilesForAddress: ->
    fakeShortFormHelperService =
      proofOptions: jasmine.createSpy()
    fakeFileUploadService =
      uploadedRentBurdenRentFiles: jasmine.createSpy()
      hasRentBurdenFiles: jasmine.createSpy()
      deleteRentBurdenPreferenceFiles: ->

    # set up default fake bindings
    pref = 'liveInSf'
    fakeBindings =
      application: fakeApplication
      title: 'Preference'

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
        $translate: $translate
    )

    beforeEach ->
      fakeBindings.application = fakeApplication
      fakeBindings.customInvalidMessage = 'invalid'
      fakeBindings.application.preferences.documents.rentBurden[fakeAddress] =
        lease: {file: 'somefile'}
        rent:
          1: {file: 'somefile'}
      ctrl = $componentController 'rentBurdenPreferenceDashboard', locals, fakeBindings

    describe 'hasFiles', ->
      it 'should call function on FileUploadService', ->
        ctrl.hasFiles('123 Main St')
        expect(fakeFileUploadService.hasRentBurdenFiles).toHaveBeenCalledWith('123 Main St')

    describe 'hasCompleteFiles', ->
      it 'calls on hasCompleteRentBurdenFilesForAddress on ShortFormApplicationService', ->
        spyOn(fakeShortFormApplicationService, 'hasCompleteRentBurdenFilesForAddress').and.returnValue(false)
        ctrl.hasCompleteFiles(fakeAddress)
        expect(fakeShortFormApplicationService.hasCompleteRentBurdenFilesForAddress).toHaveBeenCalledWith(fakeAddress)

    describe 'hasFileForType', ->
      it 'returns true for available lease file', ->
        expect(ctrl.hasFileForType(fakeAddress, 'lease')).toEqual true

      it  'returns false for unavailable lease file', ->
        fakeBindings.application.preferences.documents.rentBurden[fakeAddress].lease.file = null
        expect(ctrl.hasFileForType(fakeAddress, 'lease')).toEqual false

      it 'returns true for available rent file', ->
        expect(ctrl.hasFileForType(fakeAddress, 'rent')).toEqual true

      it 'returns false for unavaiable rent file', ->
        fakeBindings.application.preferences.documents.rentBurden[fakeAddress].rent = null
        expect(ctrl.hasFileForType(fakeAddress, 'rent')).toEqual false

    describe 'addressInvalid', ->
      describe 'customInvalidMessage exists and there are incomplete files for address', ->
        it 'returns true', ->
          spyOn(fakeShortFormApplicationService, 'hasCompleteRentBurdenFilesForAddress').and.returnValue(false)
          expect(ctrl.addressInvalid(fakeAddress)).toEqual true

      describe 'customInvalidMessage exists and there are complete files for address', ->
        it 'returns false', ->
          spyOn(fakeShortFormApplicationService, 'hasCompleteRentBurdenFilesForAddress').and.returnValue(true)
          expect(ctrl.addressInvalid(fakeAddress)).toEqual false
