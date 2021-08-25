do ->
  'use strict'
  describe 'Preference Components', ->
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
      listing:
        Id: '1d11xc1'
      inputInvalid: jasmine.createSpy()
      eligibleMembers: jasmine.createSpy()
      cancelPreference: jasmine.createSpy()
      cancelOptOut: jasmine.createSpy()
      liveInSfMembers: jasmine.createSpy()
      workInSfMembers: jasmine.createSpy()
      unsetPreferenceFields: jasmine.createSpy()
    fakeShortFormHelperService =
      proofOptions: jasmine.createSpy()
    fakeRentBurdenFileService =
      uploadedRentBurdenRentFiles: jasmine.createSpy()
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
      spyOn(fakeRentBurdenFileService, 'deleteRentBurdenPreferenceFiles').and.returnValue(deferred.promise)
      locals =
        ShortFormApplicationService: fakeShortFormApplicationService
        ShortFormHelperService: fakeShortFormHelperService
        RentBurdenFileService: fakeRentBurdenFileService
        $translate: $translate
    )

# ==============================================
    describe 'preferenceComponent', ->
      beforeEach ->
        fakeBindings =
          preference: pref
          application: fakeApplication
          hasProof: true
          title: 'Preference'

      describe 'initVariables', ->
        it 'should set proofDocument if `hasProof`', ->
          fakeBindings.hasProof = true
          ctrl = $componentController 'preference', locals, fakeBindings
          proofDocument = ctrl.application.preferences.documents[ctrl.preference]
          expect(proofDocument).not.toEqual(undefined)
          expect(ctrl.proofDocument).toEqual(proofDocument)
        it 'should not set proofDocument if does not `hasProof`', ->
          fakeBindings.hasProof = false
          ctrl = $componentController 'preference', locals, fakeBindings
          expect(ctrl.proofDocument).toEqual(undefined)

      describe 'resetPreference', ->
        beforeEach ->
          ctrl = $componentController 'preference', locals, fakeBindings
        it 'should call cancelPreference on Service if preference is unset', ->
          fakeBindings.application.preferences[pref] = false
          ctrl.resetPreference()
          expect(fakeShortFormApplicationService.cancelPreference).toHaveBeenCalledWith(pref)
        it 'should call cancelOptOut on Service if preference is set', ->
          fakeBindings.application.preferences[pref] = true
          ctrl.resetPreference()
          expect(fakeShortFormApplicationService.cancelOptOut).toHaveBeenCalledWith(pref)

      describe 'isEmploymentDisability', ->
        it 'should determine if the preference is employment/disability based on the title', ->
          fakeBindings.title = 'Employment or Disability Preference'
          ctrl = $componentController 'preference', locals, fakeBindings
          expect(ctrl.isEmploymentDisability()).toBe(true)
          fakeBindings.title = 'Something else'
          ctrl = $componentController 'preference', locals, fakeBindings
          expect(ctrl.isEmploymentDisability()).toBe(false)

      describe 'isTida', ->
        it 'should determine if the preference is employment/disability based on the title', ->
          fakeBindings.title = 'Treasure Island Resident (TIR) Preference'
          ctrl = $componentController 'preference', locals, fakeBindings
          expect(ctrl.isTida()).toBe(true)
          fakeBindings.title = 'Something else'
          ctrl = $componentController 'preference', locals, fakeBindings
          expect(ctrl.isTida()).toBe(false)

      describe 'descriptionToTranslate', ->
        it 'uses the employment or disability key for  Employement or Disability Preference', ->
          fakeBindings.title = 'Employment or Disability Preference'
          ctrl = $componentController 'preference', locals, fakeBindings
          expect(ctrl.descriptionToTranslate()).toContain('employment_disability')
        it 'defaults to the translatedDescription binding if not employment/disability', ->
          fakeBindings.title = 'Not employment or disability'
          fakeBindings.translatedDescription = 'translated_description_key'
          ctrl = $componentController 'preference', locals, fakeBindings
          expect(ctrl.descriptionToTranslate()).toEqual('translated_description_key')

      it 'sets expected translation keys for TIDA', ->
          fakeBindings.title = 'Treasure Island Resident (TIR) Preference'
          ctrl = $componentController 'preference', locals, fakeBindings
          expect(ctrl.certificateLabelKey).toContain('tida')
          expect(ctrl.certificateCaptionKey).toContain('tida')

      it 'does not set certificate translation keys for non-TIDA preferences', ->
          fakeBindings.title = 'not-tida'
          ctrl = $componentController 'preference', locals, fakeBindings
          expect(ctrl.certificateLabelKey).toBeUndefined()
          expect(ctrl.certificateCaptionKey).toBeUndefined()

# ==============================================
    describe 'liveWorkComboPreference', ->
      beforeEach ->
        fakeBindings.application.preferences.liveWorkInSf_preference = 'liveInSf'
        ctrl = $componentController 'liveWorkComboPreference', locals, fakeBindings

      describe 'initVariables', ->
        it 'should get appropriate proof options to match liveWorkInSf_preference', ->
          expect(fakeShortFormHelperService.proofOptions).toHaveBeenCalledWith('liveInSf')
        it 'should set appropriate preference to match liveWorkInSf_preference', ->
          expect(ctrl.application.preferences.liveInSf).toEqual(true)
          expect(fakeShortFormApplicationService.liveInSfMembers).toHaveBeenCalled()
        it 'should set proofDocument', ->
          proofDocument = ctrl.application.preferences.documents.liveInSf
          expect(proofDocument).not.toEqual(undefined)
          expect(ctrl.proofDocument).toEqual(proofDocument)

      describe 'resetLiveWorkData', ->
        it 'should call appropriate reset functions on Service', ->
          ctrl.resetLiveWorkData()
          expect(fakeShortFormApplicationService.cancelOptOut).toHaveBeenCalledWith('liveWorkInSf')
          expect(fakeShortFormApplicationService.unsetPreferenceFields).toHaveBeenCalledWith('liveInSf')
          expect(fakeShortFormApplicationService.unsetPreferenceFields).toHaveBeenCalledWith('workInSf')


# ==============================================
    describe 'rentBurdenedPreference', ->
      beforeEach ->
        fakeBindings.address = fakeAddress
        fakeBindings.groupedHouseholdAddressIndex = 0
        fakeBindings.application.preferences.documents.rentBurden[fakeAddress] =
          lease: {}
          rent: {}
        ctrl = $componentController 'rentBurdenedPreference', locals, fakeBindings

      it 'should get appropriate proof options to match rentBurden', ->
        expect(fakeShortFormHelperService.proofOptions).toHaveBeenCalledWith('rentBurden')

      describe 'initUploadedRentFiles', ->
        it 'should call uploadedRentBurdenRentFiles on Service', ->
          expect(fakeRentBurdenFileService.uploadedRentBurdenRentFiles).toHaveBeenCalledWith(fakeAddress)

      describe 'initNewRentDocument', ->
        it 'should set up an object with a timestamped id for rent_burden_index', ->
          now = new Date().getTime()
          ctrl.initNewRentDocument()
          expect(ctrl.rentDocuments).not.toEqual({})
          expect(ctrl.newRentDocument.id).not.toBeLessThan(now)

      describe 'resetPreferenceData', ->
        it 'should cancelOptOut of rentBurden', ->
          ctrl.resetPreferenceData()
          expect(fakeShortFormApplicationService.cancelOptOut).toHaveBeenCalledWith('rentBurden')
        it 'should call deleteRentBurdenPreferenceFiles on Service if preference is unset', ->
          fakeBindings.application.preferences.rentBurden = false
          ctrl.resetPreferenceData()
          expect(fakeRentBurdenFileService.deleteRentBurdenPreferenceFiles).toHaveBeenCalled()
