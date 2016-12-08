do ->
  'use strict'
  describe 'ShortFormApplicationController', ->
    scope = undefined
    state = undefined
    fakeIdle = undefined
    fakeTitle = undefined
    eligibilityResponse = undefined
    callbackUrl = undefined
    fakeListing = getJSONFixture('listings-api-show.json').listing
    validHousehold = getJSONFixture('short_form-api-validate_household-match.json')
    invalidHousehold = getJSONFixture('short_form-api-validate_household-not-match.json')
    fakeListingService =
      hasPreference: () ->
    fakeAnalyticsService =
      trackFormSuccess: jasmine.createSpy()
      trackFormError: jasmine.createSpy()
      trackFormAbandon: jasmine.createSpy()
    fakeShortFormApplicationService =
      form:
        applicationForm:
          $valid: true
          $setPristine: -> undefined
      listing: fakeListing
      applicant:
        home_address: { address1: null, city: null, state: null, zip: null }
        language: "English"
        phone: null
        mailing_address: { address1: null, city: null, state: null, zip: null }
        gender: {}
      householdMembers: []
      preferences: {}
      application: {}
      alternateContact: {}
      householdMember: {
        firstName: "Oberon"
      }
      isWelcomePage: jasmine.createSpy()
      isShortFormPage: jasmine.createSpy().and.returnValue(true)
      copyHomeToMailingAddress: jasmine.createSpy()
      addHouseholdMember: jasmine.createSpy()
      cancelHouseholdMember: jasmine.createSpy()
      refreshPreferences: jasmine.createSpy()
      clearPhoneData: jasmine.createSpy()
      validMailingAddress: jasmine.createSpy()
      liveInSfMembers: () ->
      workInSfMembers: () ->
      neighborhoodResidenceMembers: () ->
      clearAlternateContactDetails: jasmine.createSpy()
      invalidateHouseholdForm: jasmine.createSpy()
      invalidateIncomeForm: jasmine.createSpy()
      invalidateContactForm: jasmine.createSpy()
      validateHouseholdMemberAddress: ->
        { error: -> null }
      validateApplicantAddress: ->
        { error: -> null }
      checkHouseholdEligiblity: (listing) ->
      submitApplication: (options={}) ->
    fakeFunctions =
      fakeGetLandingPage: (section, application) ->
        'household-intro'
      fakeIsLoading: -> false
      fakeSubmitOptionsForCurrentPage: -> {}
    fakeAccountService = {}
    fakeShortFormNavigationService = undefined
    fakeShortFormHelperService = {}
    fakeAccountService =
      loggedIn: () ->
    fakeAddressValidationService =
      failedValidation: jasmine.createSpy()
    fakeFileUploadService =
      uploadProof: jasmine.createSpy()
    fakeEvent =
      preventDefault: ->

    beforeEach module('dahlia.controllers', ($provide) ->
      fakeShortFormNavigationService =
        sections: []
        hasNav: jasmine.createSpy()
        getLandingPage: spyOn(fakeFunctions, 'fakeGetLandingPage').and.callThrough()
        isLoading: spyOn(fakeFunctions, 'fakeIsLoading').and.callThrough()
        submitOptionsForCurrentPage: spyOn(fakeFunctions, 'fakeSubmitOptionsForCurrentPage').and.callThrough()
        _currentPage: jasmine.createSpy()
      return
    )

    beforeEach inject(($rootScope, $controller, $q, _$document_) ->
      scope = $rootScope.$new()
      state = jasmine.createSpyObj('$state', ['go'])
      fakeTitle = jasmine.createSpyObj('Title', ['restore'])
      state.current = {name: 'dahlia.short-form-welcome.overview'}
      state.params = {}

      $translate = {
        instant: jasmine.createSpy('$translate.instant').and.returnValue('newmessage')
      }

      deferred = $q.defer()
      deferred.resolve('resolveData')
      spyOn(fakeShortFormApplicationService, 'checkHouseholdEligiblity').and.returnValue(deferred.promise)
      spyOn(fakeShortFormApplicationService, 'validateApplicantAddress').and.callThrough()
      spyOn(fakeShortFormApplicationService, 'validateHouseholdMemberAddress').and.callThrough()
      spyOn(fakeShortFormApplicationService, 'submitApplication').and.callFake ->
        state.go('dahlia.my-applications', {skipConfirm: true})
        deferred.promise

      _$document_.scrollToElement = jasmine.createSpy()

      $controller 'ShortFormApplicationController',
        $scope: scope
        $state: state
        $document: _$document_
        Idle: fakeIdle
        Title: fakeTitle
        $translate: $translate
        ShortFormApplicationService: fakeShortFormApplicationService
        ShortFormNavigationService: fakeShortFormNavigationService
        ShortFormHelperService: fakeShortFormHelperService
        AnalyticsService: fakeAnalyticsService
        FileUploadService: fakeFileUploadService
        AddressValidationService: fakeAddressValidationService
        AccountService: fakeAccountService
        ListingService: fakeListingService
      return
    )

    describe '$scope.listing', ->
      it 'populates scope with a single listing', ->
        expect(scope.listing).toEqual fakeListing

    describe '$scope.hasNav', ->
      it 'calls function on navService', ->
        scope.hasNav()
        expect(fakeShortFormNavigationService.hasNav).toHaveBeenCalled()

    describe '$scope.submitForm', ->
      it 'calls submitOptionsForCurrentPage function on navService if form is valid', ->
        scope.submitForm()
        expect(fakeShortFormNavigationService.submitOptionsForCurrentPage).toHaveBeenCalled()

      it 'calls isLoading function on navService', ->
        scope.submitForm()
        expect(fakeShortFormNavigationService.isLoading).toHaveBeenCalled()

    describe '$scope.checkIfAlternateContactInfoNeeded', ->
      describe 'No alternate contact indicated', ->
        it 'navigates ahead to optional info', ->
          scope.alternateContact.alternateContactType = 'None'
          scope.checkIfAlternateContactInfoNeeded()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.household-intro')

        it 'calls clearAlternateContactDetails from ShortFormApplicationService', ->
          scope.alternateContact.alternateContactType = 'None'
          scope.checkIfAlternateContactInfoNeeded()
          expect(fakeShortFormApplicationService.clearAlternateContactDetails).toHaveBeenCalled()

      describe 'Alternate contact type indicated', ->
        it 'navigates ahead to alt contact name page', ->
          scope.alternateContact.alternateContactType = 'Friend'
          scope.checkIfAlternateContactInfoNeeded()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.alternate-contact-name')

    describe '$scope.checkIfMailingAddressNeeded', ->
      describe 'hasAltMailingAddress unchecked', ->
        it 'calls Service function to copy home address to mailing', ->
          scope.applicant.hasAltMailingAddress = false
          scope.checkIfMailingAddressNeeded()
          expect(fakeShortFormApplicationService.copyHomeToMailingAddress).toHaveBeenCalled()

    describe '$scope.addressChange', ->
      it 'unsets neighborhoodPreferenceMatch on member', ->
        scope.applicant.neighborhoodPreferenceMatch = 'Matched'
        scope.addressChange('applicant')
        expect(scope.applicant.neighborhoodPreferenceMatch).toEqual null

      it 'calls copyHomeToMailingAddress if member == applicant', ->
        scope.applicant.neighborhoodPreferenceMatch = 'Matched'
        scope.addressChange('applicant')
        expect(fakeShortFormApplicationService.copyHomeToMailingAddress).toHaveBeenCalled()

    describe 'scope.requiredContactInformationMissing', ->
      describe 'phone, email, address not provided', ->
        it 'returns true', ->
          scope.applicant.noPhone = true
          scope.applicant.noAddress = true
          scope.applicant.noEmail = true
          expect(scope.requiredContactInformationMissing()).toEqual true

    describe '$scope.addHouseholdMember', ->
      describe 'user has same address applicant', ->
        it 'directly calls addHouseholdMember in ShortFormApplicationService', ->
          scope.householdMember.hasSameAddressAsApplicant = 'Yes'
          scope.addHouseholdMember()
          expect(fakeShortFormApplicationService.addHouseholdMember).toHaveBeenCalledWith(scope.householdMember)

      describe 'user does not have same address applicant', ->
        it 'calls validateHouseholdMemberAddress in ShortFormApplicationService', ->
          scope.householdMember.hasSameAddressAsApplicant = 'No'
          scope.householdMember.neighborhoodPreferenceMatch = false
          scope.addHouseholdMember()
          expect(fakeShortFormApplicationService.validateHouseholdMemberAddress).toHaveBeenCalled()

    describe '$scope.cancelHouseholdMember', ->
      it 'calls cancelHouseholdMember in ShortFormApplicationService', ->
        scope.cancelHouseholdMember()
        expect(fakeShortFormApplicationService.cancelHouseholdMember).toHaveBeenCalled()

      it 'navigates to household members index', ->
        scope.cancelHouseholdMember()
        expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.household-members')

    describe '$scope.addressFailedValidation', ->
      it 'calls failedValidation in AddressValidationService', ->
        scope.validated_home_address = {street1: 'x'}
        scope.addressError = true
        scope.addressFailedValidation('home_address')
        expect(fakeAddressValidationService.failedValidation).toHaveBeenCalled()

    describe '$scope.addressInputInvalid', ->
      it 'calls failedValidation in AddressValidationService', ->
        scope.form = {applicationForm: {}}
        scope.validated_home_address = {street1: 'x'}
        scope.addressError = true
        scope.addressInputInvalid('home_address')
        expect(fakeAddressValidationService.failedValidation).toHaveBeenCalled()

    describe '$scope.checkIfAddressVerificationNeeded', ->
      describe 'No address verification indicated', ->
        it 'navigates ahead to alt contact type', ->
          scope.applicant.noAddress = true
          scope.checkIfAddressVerificationNeeded()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.alternate-contact-type')

      describe 'Alternate contact type indicated', ->
        it 'navigates ahead to verify address page', ->
          scope.applicant.noAddress = false
          scope.checkIfAddressVerificationNeeded()
          expect(fakeShortFormApplicationService.validateApplicantAddress).toHaveBeenCalled()

    describe '$scope.getLandingPage', ->
      it 'calls getLandingPage in ShortFormNavigationService', ->
        scope.getLandingPage({name: 'Household'})
        expect(fakeShortFormNavigationService.getLandingPage).toHaveBeenCalled()

    describe '$scope.checkPreferenceEligibility', ->
      it 'calls refreshPreferences in ShortFormApplicationService', ->
        scope.checkPreferenceEligibility()
        expect(fakeShortFormApplicationService.refreshPreferences).toHaveBeenCalled()

    describe '$scope.liveInSfMembers', ->
      it 'calls liveInSfMembers in ShortFormApplicationService', ->
        spyOn(fakeShortFormApplicationService, 'liveInSfMembers').and.returnValue([])
        scope.liveInSfMembers()
        expect(fakeShortFormApplicationService.liveInSfMembers).toHaveBeenCalled()

    describe '$scope.workInSfMembers', ->
      it 'calls workInSfMembers in ShortFormApplicationService', ->
        spyOn(fakeShortFormApplicationService, 'workInSfMembers').and.returnValue([])
        scope.workInSfMembers()
        expect(fakeShortFormApplicationService.workInSfMembers).toHaveBeenCalled()

    describe 'validateHouseholdEligibility', ->
      it 'calls checkHouseholdEligiblity in ShortFormApplicationService', ->
        scope.listing = fakeListing
        scope.validateHouseholdEligibility('householdMatch')
        expect(fakeShortFormApplicationService.checkHouseholdEligiblity).toHaveBeenCalledWith(fakeListing)
      it 'skips ahead if incomeMatch and vouchers', ->
        scope.listing = fakeListing
        scope.application.householdVouchersSubsidies = 'Yes'
        scope.validateHouseholdEligibility('incomeMatch')
        expect(state.go).toHaveBeenCalled()

    describe '$scope.clearPhoneData', ->
      it 'calls clearPhoneData in ShortFormApplicationService', ->
        type = 'phone'
        scope.clearPhoneData(type)
        expect(fakeShortFormApplicationService.clearPhoneData).toHaveBeenCalledWith(type)

    describe '$scope.validMailingAddress', ->
      it 'calls validMailingAddress in ShortFormApplicationService', ->
        scope.validMailingAddress()
        expect(fakeShortFormApplicationService.validMailingAddress).toHaveBeenCalled()

    describe '_respondToHouseholdEligibilityResults', ->
      describe 'matched', ->
        #replace with a jasmine fixture
        beforeEach ->
          eligibilityResponse =
            data: validHousehold

        it 'reset the eligibility error message', ->
          scope.householdEligibilityErrorMessage = 'Error'
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch')
          expect(scope.householdEligibilityErrorMessage).toEqual(null)

        it 'navigates to the given callback url', ->
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch')
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.preferences-programs')

      describe 'not matched', ->
        beforeEach ->
          eligibilityResponse =
            data: invalidHousehold

        it 'updates the scope that shows the alert', ->
          scope.hideAlert = true
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch')
          expect(scope.hideAlert).toEqual(false)

        it 'expects household section to be invalidated', ->
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch', callbackUrl)
          expect(fakeShortFormApplicationService.invalidateHouseholdForm).toHaveBeenCalled()

        it 'assigns an error message function', ->
          scope.householdEligibilityErrorMessage  = null
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch')
          expect(scope.householdEligibilityErrorMessage).not.toEqual(null)

        it 'tracks an income form error in analytics', ->
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'incomeMatch')
          expect(fakeAnalyticsService.trackFormError).toHaveBeenCalledWith('Application', 'income too low')

        it 'tracks a household size form error in analytics', ->
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch')
          expect(fakeAnalyticsService.trackFormError).toHaveBeenCalledWith('Application', 'household too big')

    describe 'clearHouseholdErrorMessage', ->
      it 'assigns scope.householdEligibilityErrorMessage to null', ->
        scope.householdEligibilityErrorMessage = 'some error message'
        scope.clearHouseholdErrorMessage()
        expect(scope.householdEligibilityErrorMessage).toEqual(null)

    describe 'submitApplication', ->
      it 'calls submitApplication ShortFormApplicationService', ->
        scope.submitApplication()
        expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalledWith({finish: true})

    describe 'checkIfPreferencesApply', ->
      beforeEach ->
        members = ['somemembers']
        spyOn(fakeShortFormApplicationService, 'liveInSfMembers').and.returnValue(members)
        spyOn(fakeShortFormApplicationService, 'workInSfMembers').and.returnValue(members)
        spyOn(fakeShortFormApplicationService, 'neighborhoodResidenceMembers').and.returnValue([])

      describe 'household is eligible for liveWork preferences',->
        it 'routes user to live-work preference page', ->
          fakeShortFormApplicationService.eligibleForLiveWorkOrNRHP = jasmine.createSpy().and.returnValue(true)
          scope.checkIfPreferencesApply()
          path = 'dahlia.short-form-application.live-work-preference'
          expect(state.go).toHaveBeenCalledWith(path)

      describe 'preferences do not apply to household',->
        it 'routes user to general lottery notice page', ->
          fakeShortFormApplicationService.eligibleForLiveWorkOrNRHP = jasmine.createSpy().and.returnValue(false)
          fakeShortFormApplicationService.applicantHasNoPreferences = jasmine.createSpy().and.returnValue(true)
          scope.checkIfPreferencesApply()
          path = 'dahlia.short-form-application.general-lottery-notice'
          expect(state.go).toHaveBeenCalledWith(path)

      describe 'household is not eligible for liveWork but has COP/DTHP',->
        it 'routes user ahead to income section', ->
          fakeShortFormApplicationService.eligibleForLiveWorkOrNRHP = jasmine.createSpy().and.returnValue(false)
          fakeShortFormApplicationService.applicantHasNoPreferences = jasmine.createSpy().and.returnValue(false)
          scope.checkIfPreferencesApply()
          path = 'dahlia.short-form-application.income-vouchers'
          expect(state.go).toHaveBeenCalledWith(path)

    describe 'uploadProof', ->
      it 'calls uploadProof on FileUploadService', ->
        file = {}
        pref = 'liveInSf'
        docType = 'water bill'
        scope.uploadProof(file, pref, docType)
        expect(fakeFileUploadService.uploadProof).toHaveBeenCalledWith(file, pref, docType, scope.listing.Id)

    describe 'saveAndFinishLater', ->
      describe 'logged in', ->
        beforeEach ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(true)
          scope.saveAndFinishLater(fakeEvent)

        it 'submits application as a draft', ->
          expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalled()

        it 'routes user to my applications', ->
          expect(state.go).toHaveBeenCalledWith('dahlia.my-applications', {skipConfirm: true})

      describe 'not logged in', ->
        it 'routes directly to create account', ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(false)
          scope.saveAndFinishLater(fakeEvent)
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.create-account')

    describe 'showPreference', ->
      describe 'listing does not have preference', ->
        it 'returns false', ->
          spyOn(fakeListingService, 'hasPreference').and.returnValue(false)
          expect(scope.showPreference('liveInSf')).toEqual false

      describe 'listing has preference', ->
        it 'returns true', ->
          spyOn(fakeListingService, 'hasPreference').and.returnValue(true)
          expect(scope.showPreference('displaced')).toEqual true
