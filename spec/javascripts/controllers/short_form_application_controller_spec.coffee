do ->
  'use strict'
  describe 'ShortFormApplicationController', ->
    scope = undefined
    state = undefined
    translate = {
      instant: jasmine.createSpy().and.returnValue('newmessage')
    }
    fakeIdle = undefined
    fakeTitle = undefined
    eligibility = undefined
    error = undefined
    callbackUrl = undefined
    fakeListing = getJSONFixture('listings-api-show.json').listing
    validHousehold = getJSONFixture('short_form-api-validate_household-match.json')
    invalidHousehold = getJSONFixture('short_form-api-validate_household-not-match.json')
    fakeAnalyticsService =
      trackFormSuccess: jasmine.createSpy()
      trackFormError: jasmine.createSpy()
      trackFormAbandon: jasmine.createSpy()
    fakeShortFormApplicationService =
      form:
        applicationForm:
          $valid: true
          $setPristine: jasmine.createSpy()
      eligibilityErrors: []
      inputInvalid: ->
      listing: fakeListing
      applicant:
        home_address: { address1: null, city: null, state: null, zip: null }
        language: "English"
        phone: null
        mailing_address: { address1: null, city: null, state: null, zip: null }
        gender: {}
      householdMembers: []
      preferences: {
        optOut: {}
      }
      application:
        status: 'draft'
        validatedForms:
          You: {}
          Household: {}
          Preferences: {}
          Income: {}
          Review: {}
        overwrittenApplicantInfo: null
      applicationDefaults:
        applicant:
          home_address: { address1: null, address2: "", city: null, state: null, zip: null }
          phone: null
          mailing_address: { address1: null, address2: "", city: null, state: null, zip: null }
          terms: {}
      alternateContact: {}
      householdMember: {
        firstName: "Oberon"
      }
      isWelcomePage: jasmine.createSpy()
      isShortFormPage: jasmine.createSpy().and.returnValue(true)
      copyHomeToMailingAddress: jasmine.createSpy()
      addHouseholdMember: jasmine.createSpy()
      cancelHouseholdMember: jasmine.createSpy()
      householdSize: -> 1
      calculateHouseholdIncome: -> 1000
      clearPhoneData: jasmine.createSpy()
      validMailingAddress: jasmine.createSpy()
      liveInSfMembers: () ->
      workInSfMembers: () ->
      liveInTheNeighborhoodMembers: () ->
      copyNeighborhoodToLiveInSf: jasmine.createSpy()
      clearAlternateContactDetails: jasmine.createSpy()
      invalidateHouseholdForm: jasmine.createSpy()
      invalidateIncomeForm: jasmine.createSpy()
      invalidateContactForm: jasmine.createSpy()
      resetMonthlyRentForm: jasmine.createSpy()
      invalidateMonthlyRentForm: jasmine.createSpy()
      invalidatePreferencesForm: jasmine.createSpy()
      resetAssistedHousingForm: jasmine.createSpy()
      signInSubmitApplication: jasmine.createSpy()
      preferenceRequired: jasmine.createSpy()
      refreshPreferences: jasmine.createSpy()
      resetPreference: jasmine.createSpy()
      showPreference: jasmine.createSpy()
      getMyApplicationForListing: ->
      keepCurrentDraftApplication: ->
      validateHouseholdMemberAddress: ->
        { error: -> null }
      validateApplicantAddress: ->
        { error: -> null }
      checkHouseholdEligibility: (listing) ->
      hasHouseholdPublicHousingQuestion: ->
      submitApplication: (options={}) ->
      listingHasPreference: ->
      applicationHasPreference: ->
      eligibleForAssistedHousing: ->
      eligibleForRentBurden: ->
      eligibleForADHP: ->
      hasCompleteRentBurdenFiles: ->
      hasCompleteRentBurdenFilesForAddress: jasmine.createSpy()
      cancelPreference: jasmine.createSpy()
      setApplicationLanguage: jasmine.createSpy()
      claimedCustomPreference: jasmine.createSpy()
      resetApplicationData: ->
      hasDifferentInfo: ->
      resetApplicantUserData: jasmine.createSpy()
      importUserData: jasmine.createSpy()
      cancelPreferencesForMember: jasmine.createSpy()
      resetCompletedSections: jasmine.createSpy()
      applicantDoesNotmeetAllSeniorBuildingRequirements: ->
      householdDoesNotMeetAtLeastOneSeniorRequirement: jasmine.createSpy()
      memberAgeOnForm: ->
      isEnteringShortForm: jasmine.createSpy()
      storeLastPage: jasmine.createSpy()
      addSeniorEligibilityError: jasmine.createSpy()
      loadApplication: jasmine.createSpy()
      completeSection: jasmine.createSpy()
      listingIsRental: jasmine.createSpy()
      listingIsSale: jasmine.createSpy()
      getRTRPreference: jasmine.createSpy().and.returnValue('aliceGriffith')
      listingHasRTRPreference: ->
    fakeFunctions =
      fakeIsLoading: -> false
      foo1: jasmine.createSpy()
      foo2: jasmine.createSpy()
    fakeShortFormNavigationService = undefined
    fakeShortFormHelperService =
      fileAttachmentsForRentBurden: jasmine.createSpy()
    fakeAccountService =
      signIn: ->
      signOut: ->
      loggedIn: () ->
    fakeListingDataService = {}
    fakeAddressValidationService = {
      validate: ->
      validationError: jasmine.createSpy()
    }
    fakeFileUploadService =
      deleteFile: jasmine.createSpy()
    fakeRentBurdenFileService =
      deleteRentBurdenPreferenceFiles: ->
    fakeSharedService = {}
    fakeEvent =
      preventDefault: ->
    fakeHHOpts = {}
    fakeIncomeOpts = {}
    fakeListingIdentityService =
      isSale: jasmine.createSpy()
    $q = undefined
    $rootScope = undefined

    beforeEach module('dahlia.controllers', ($provide) ->
      fakeShortFormNavigationService =
        goToApplicationPage: jasmine.createSpy()
        getStartOfSection: jasmine.createSpy()
        goToSection: jasmine.createSpy()
        submitOptionsForCurrentPage: jasmine.createSpy()
        hasNav: jasmine.createSpy()
        initialState: jasmine.createSpy().and.returnValue('initialStatePage')
        isLoading: spyOn(fakeFunctions, 'fakeIsLoading').and.callThrough()
        _currentPage: jasmine.createSpy()
        getNextReservedPageIfAvailable: jasmine.createSpy()
      return
    )

    beforeEach inject((_$rootScope_, $controller, _$q_, _$document_) ->
      $rootScope = _$rootScope_
      scope = $rootScope.$new()
      state = jasmine.createSpyObj('$state', ['go'])
      fakeTitle = jasmine.createSpyObj('Title', ['restore'])
      state.current = {name: 'dahlia.short-form-welcome.overview'}
      state.params = {}
      $q = _$q_

      deferred = $q.defer()
      deferred.resolve('resolveData')
      spyOn(fakeAccountService, 'signIn').and.returnValue(deferred.promise)
      spyOn(fakeAccountService, 'signOut').and.returnValue(deferred.promise)
      spyOn(fakeRentBurdenFileService, 'deleteRentBurdenPreferenceFiles').and.returnValue(deferred.promise)
      spyOn(fakeAddressValidationService, 'validate').and.returnValue(deferred.promise)
      spyOn(fakeShortFormApplicationService, 'checkHouseholdEligibility').and.returnValue(deferred.promise)
      spyOn(fakeShortFormApplicationService, 'keepCurrentDraftApplication').and.returnValue(deferred.promise)
      spyOn(fakeShortFormApplicationService, 'validateApplicantAddress').and.callThrough()
      spyOn(fakeShortFormApplicationService, 'validateHouseholdMemberAddress').and.callThrough()
      spyOn(fakeShortFormApplicationService, 'hasHouseholdPublicHousingQuestion').and.callThrough()
      spyOn(fakeShortFormApplicationService, 'resetApplicationData').and.callThrough()
      spyOn(fakeShortFormApplicationService, 'submitApplication').and.callFake ->
        state.go('dahlia.my-applications', {skipConfirm: true})
        deferred.promise

      _$document_.scrollToElement = jasmine.createSpy()

      $controller 'ShortFormApplicationController',
        $document: _$document_
        $scope: scope
        $state: state
        $translate: translate
        AccountService: fakeAccountService
        AddressValidationService: fakeAddressValidationService
        AnalyticsService: fakeAnalyticsService
        Idle: fakeIdle
        inputMaxLength: {}
        FileUploadService: fakeFileUploadService
        ListingDataService: fakeListingDataService
        ListingIdentityService: fakeListingIdentityService
        RentBurdenFileService: fakeRentBurdenFileService
        SharedService: fakeSharedService
        ShortFormApplicationService: fakeShortFormApplicationService
        ShortFormHelperService: fakeShortFormHelperService
        ShortFormNavigationService: fakeShortFormNavigationService
        Title: fakeTitle
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
      beforeEach ->
        scope.handleFormSuccess = jasmine.createSpy()
        scope.trackFormErrors = jasmine.createSpy()
        scope.handleErrorState = jasmine.createSpy()

      it 'calls ShortFormNavigationService.isLoading with true', ->
        scope.submitForm()
        expect(fakeShortFormNavigationService.isLoading).toHaveBeenCalledWith(true)

      describe 'when form is valid', ->
        beforeEach ->
          fakeShortFormApplicationService.form.applicationForm.$valid = true

        it 'calls form.$setPristine', ->
          form = fakeShortFormApplicationService.form.applicationForm
          scope.submitForm()
          expect(form.$setPristine).toHaveBeenCalled()

        it 'calls $scope.handleFormSuccess', ->
          scope.submitForm()
          expect(scope.handleFormSuccess).toHaveBeenCalled()

      describe 'when form is invalid', ->
        beforeEach ->
          fakeShortFormApplicationService.form.applicationForm.$valid = false

        it 'calls $scope.trackFormErrors', ->
          scope.submitForm()
          expect(scope.trackFormErrors).toHaveBeenCalled()

        it 'calls $scope.handleErrorState', ->
          scope.submitForm()
          expect(scope.handleErrorState).toHaveBeenCalled()

    describe '$scope.handleFormSuccess', ->
      it 'calls ShortFormNavigationService.submitOptionsForCurrentPage', ->
        fakeShortFormNavigationService.submitOptionsForCurrentPage.and.returnValue({})
        scope.handleFormSuccess()
        expect(fakeShortFormNavigationService.submitOptionsForCurrentPage).toHaveBeenCalled()

      it "calls the options' callback functions returned by ShortFormNavigationService.submitOptionsForCurrentPage", ->
        fakeShortFormNavigationService.submitOptionsForCurrentPage.and.returnValue(
          callbacks: [fakeFunctions.foo1, fakeFunctions.foo2]
        )
        scope.handleFormSuccess()
        expect(fakeFunctions.foo1).toHaveBeenCalled()
        expect(fakeFunctions.foo2).toHaveBeenCalled()

      it "calls the options' scoped callback functions with param returned by ShortFormNavigationService.submitOptionsForCurrentPage", ->
        scope.bar1 = jasmine.createSpy()
        scope.bar2 = jasmine.createSpy()
        param1 = 1
        param2 = 2
        fakeShortFormNavigationService.submitOptionsForCurrentPage.and.returnValue(
          scopedCallbacks: [
            {func: 'bar1', param: param1}
            {func: 'bar2', param: param2}
          ]
        )
        scope.handleFormSuccess()
        expect(scope.bar1).toHaveBeenCalledWith(param1)
        expect(scope.bar2).toHaveBeenCalledWith(param2)

      it "calls ShortFormNavigationService.goToApplicationPage with the options' path returned by ShortFormNavigationService.submitOptionsForCurrentPage", ->
        path = 'baz'
        fakeShortFormNavigationService.submitOptionsForCurrentPage.and.returnValue({path: path})
        scope.handleFormSuccess()
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path)

    describe '$scope.checkIfAlternateContactInfoNeeded', ->
      describe 'No alternate contact indicated', ->
        it 'calls clearAlternateContactDetails from ShortFormApplicationService', ->
          scope.alternateContact.alternateContactType = 'None'
          scope.checkIfAlternateContactInfoNeeded()
          expect(fakeShortFormApplicationService.clearAlternateContactDetails).toHaveBeenCalled()

        it 'navigates ahead to optional info', ->
          scope.alternateContact.alternateContactType = 'None'
          scope.checkIfAlternateContactInfoNeeded()
          expect(fakeShortFormNavigationService.goToSection).toHaveBeenCalledWith('Household')

      describe 'Alternate contact type indicated', ->
        it 'navigates ahead to alt contact name page', ->
          scope.alternateContact.alternateContactType = 'Friend'
          scope.checkIfAlternateContactInfoNeeded()
          expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith('dahlia.short-form-application.alternate-contact-name')

    describe '$scope.copyHomeToMailingAddress', ->
      describe 'hasAltMailingAddress unchecked', ->
        it 'calls Service function to copy home address to mailing', ->
          scope.applicant.hasAltMailingAddress = false
          scope.copyHomeToMailingAddress()
          expect(fakeShortFormApplicationService.copyHomeToMailingAddress).toHaveBeenCalled()

    describe '$scope.addressChange', ->
      it 'unsets preferenceAddressMatch on member', ->
        scope.applicant.preferenceAddressMatch = 'Matched'
        scope.addressChange('applicant')
        expect(scope.applicant.preferenceAddressMatch).toEqual null

      it 'calls copyHomeToMailingAddress if member == applicant', ->
        scope.applicant.preferenceAddressMatch = 'Matched'
        scope.addressChange('applicant')
        expect(fakeShortFormApplicationService.copyHomeToMailingAddress).toHaveBeenCalled()

      it 'calls invalidateHouseholdForm if eligibleForRentBurden', ->
        spyOn(fakeShortFormApplicationService, 'eligibleForRentBurden').and.returnValue(true)
        scope.addressChange('applicant')
        expect(fakeShortFormApplicationService.invalidateHouseholdForm).toHaveBeenCalled()

    describe '$scope.addHouseholdMember', ->
      describe 'all senior building', ->
        it 'calls applicantDoesNotmeetAllSeniorBuildingRequirements in ShortFormApplicationService', ->
          spyOn(fakeShortFormApplicationService, 'applicantDoesNotmeetAllSeniorBuildingRequirements').and.callThrough()
          scope.form.applicationForm.date_of_birth_year = {$viewValue: '1955'}
          scope.addHouseholdMember()
          expect(fakeShortFormApplicationService.applicantDoesNotmeetAllSeniorBuildingRequirements).toHaveBeenCalled()

      describe 'user has same address applicant', ->
        it 'directly calls addHouseholdMember in ShortFormApplicationService', ->
          scope.form.applicationForm.date_of_birth_year = {$viewValue: '1955'}
          scope.householdMember.hasSameAddressAsApplicant = 'Yes'
          scope.addHouseholdMember()
          expect(fakeShortFormApplicationService.addHouseholdMember).toHaveBeenCalledWith(scope.householdMember)

      describe 'user does not have same address as applicant', ->
        it 'calls validateHouseholdMemberAddress in ShortFormApplicationService', ->
          scope.householdMember.hasSameAddressAsApplicant = 'No'
          scope.householdMember.preferenceAddressMatch = null
          scope.addHouseholdMember()
          expect(fakeShortFormApplicationService.validateHouseholdMemberAddress).toHaveBeenCalled()

    describe '$scope.cancelHouseholdMember', ->
      it 'calls cancelHouseholdMember in ShortFormApplicationService', ->
        scope.cancelHouseholdMember()
        expect(fakeShortFormApplicationService.cancelHouseholdMember).toHaveBeenCalled()

      it 'navigates to household members index', ->
        scope.cancelHouseholdMember()
        expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.household-members')

    describe '$scope.addressValidationError', ->
      it 'calls validationError in AddressValidationService', ->
        scope.validated_home_address = {street1: 'x'}
        scope.addressError = true
        scope.addressValidationError('home_address')
        expect(fakeAddressValidationService.validationError).toHaveBeenCalled()

    describe '$scope.addressInputInvalid', ->
      it 'calls validationError in AddressValidationService', ->
        scope.form = {applicationForm: {}}
        scope.validated_home_address = {street1: 'x'}
        scope.addressError = true
        scope.addressInputInvalid('home_address')
        expect(fakeAddressValidationService.validationError).toHaveBeenCalled()

    describe '$scope.checkIfAddressVerificationNeeded', ->
      it 'navigates ahead to alt contact type if verification already happened', ->
        scope.applicant.preferenceAddressMatch = 'Matched'
        scope.application.validatedForms.You['verify-address'] = true
        scope.checkIfAddressVerificationNeeded()
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith('dahlia.short-form-application.alternate-contact-type')

      it 'navigates ahead to verify address page if verification had not happened', ->
        scope.applicant.preferenceAddressMatch = null
        scope.application.validatedForms.You['verify-address'] = null
        scope.checkIfAddressVerificationNeeded()
        expect(fakeShortFormApplicationService.validateApplicantAddress).toHaveBeenCalled()

    describe '$scope.getStartOfSection', ->
      it 'calls ShortFormNavigationService.getStartOfSection', ->
        section = {name: 'Household'}
        scope.getStartOfSection(section)
        expect(fakeShortFormNavigationService.getStartOfSection).toHaveBeenCalledWith(section)

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
      it 'resets the eligibility error messages', ->
        scope.eligibilityErrors = ['Error']
        scope.validateHouseholdEligibility()
        expect(scope.eligibilityErrors).toEqual([])

      it 'calls checkHouseholdEligibility in ShortFormApplicationService', ->
        scope.listing = fakeListing
        scope.validateHouseholdEligibility('householdMatch')
        expect(fakeShortFormApplicationService.checkHouseholdEligibility).toHaveBeenCalledWith(fakeListing)
      it 'skips ahead if incomeMatch and vouchers', ->
        scope.listing = fakeListing
        scope.application.householdVouchersSubsidies = 'Yes'
        scope.validateHouseholdEligibility('incomeMatch')
        expect(fakeShortFormNavigationService.goToSection).toHaveBeenCalledWith('Preferences')

      describe 'senior building', ->
        it 'checks if household meets at least one senior requirement', ->
          scope.validateHouseholdEligibility('incomeMatch')
          expect(fakeShortFormApplicationService.householdDoesNotMeetAtLeastOneSeniorRequirement).toHaveBeenCalled()
          scope.validateHouseholdEligibility('householdMatch')
          expect(fakeShortFormApplicationService.householdDoesNotMeetAtLeastOneSeniorRequirement).toHaveBeenCalled()

    describe 'checkIfPublicHousing', ->
      it 'goes to household-monthly-rent page if publicHousing answer is "No"', ->
        scope.application.hasPublicHousing = 'No'
        scope.checkIfPublicHousing()
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith('dahlia.short-form-application.household-monthly-rent')
      it 'skips ahead to next household page if publicHousing answer is "Yes"', ->
        scope.application.hasPublicHousing = 'Yes'
        scope.checkIfPublicHousing()
        expect(fakeShortFormNavigationService.getNextReservedPageIfAvailable).toHaveBeenCalled()

    describe 'goToNextReservedPageIfAvailable', ->
      it 'calls getNextReservedPageIfAvailable on navService', ->
        scope.goToNextReservedPageIfAvailable()
        expect(fakeShortFormNavigationService.getNextReservedPageIfAvailable).toHaveBeenCalled()

    describe 'publicHousingYes', ->
      it 'calls resetMonthlyRentForm in ShortFormApplicationService', ->
        scope.publicHousingYes()
        expect(fakeShortFormApplicationService.resetMonthlyRentForm).toHaveBeenCalled()
      it 'calls invalidatePreferencesForm in ShortFormApplicationService', ->
        scope.publicHousingYes()
        expect(fakeShortFormApplicationService.invalidatePreferencesForm).toHaveBeenCalled()

    describe 'publicHousingNo', ->
      it 'calls invalidateMonthlyRentForm in ShortFormApplicationService', ->
        scope.publicHousingNo()
        expect(fakeShortFormApplicationService.invalidateMonthlyRentForm).toHaveBeenCalled()
      it 'calls resetAssistedHousingForm in ShortFormApplicationService', ->
        scope.publicHousingNo()
        expect(fakeShortFormApplicationService.resetAssistedHousingForm).toHaveBeenCalled()

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
      beforeEach ->
        scope.householdDoesNotMeetSeniorRequirements = jasmine.createSpy().and.returnValue(false)
        scope.goToNextReservedPageIfAvailable = jasmine.createSpy()
        scope._determineHouseholdSizeEligibilityError = jasmine.createSpy().and.returnValue(true)
        scope.handleErrorState = jasmine.createSpy().and.returnValue(true)

      describe 'when householdMatch is true', ->
        beforeEach ->
          eligibility = { householdMatch: true }
          error = null

        it 'calls $scope.goToNextReservedPageIfAvailable', ->
          scope._respondToHouseholdEligibilityResults(eligibility, error)
          expect(scope.goToNextReservedPageIfAvailable).toHaveBeenCalled()

      describe 'when householdMatch is false', ->
        beforeEach ->
          eligibility = { householdMatch: false }
          error = 'too big'
          fakeHHOpts =
            householdSize: fakeShortFormApplicationService.householdSize()

        it 'calls $scope._determineHouseholdSizeEligibilityError', ->
          scope._respondToHouseholdEligibilityResults(eligibility, error)
          expect(scope._determineHouseholdSizeEligibilityError).toHaveBeenCalled()

    describe '_respondToIncomeEligibilityResults', ->
      describe 'when incomeMatch is true', ->
        beforeEach ->
          eligibility = { incomeMatch: true }
          error = null

        it 'navigates to the given callback url for income', ->
          scope._respondToIncomeEligibilityResults(eligibility, error)
          expect(fakeShortFormNavigationService.goToSection).toHaveBeenCalledWith('Preferences')

      describe 'when incomeMatch is false', ->
        beforeEach ->
          eligibility = { incomeMatch: false }
          error = 'too high'

          fakeHHOpts =
            householdSize: fakeShortFormApplicationService.householdSize()
          fakeIncomeOpts =
            householdSize: fakeShortFormApplicationService.householdSize()
            value: fakeShortFormApplicationService.calculateHouseholdIncome()

        it 'expects income section to be invalidated', ->
          scope._respondToIncomeEligibilityResults(eligibility, error)
          expect(fakeShortFormApplicationService.invalidateIncomeForm).toHaveBeenCalled()

        it 'assigns an error message function', ->
          scope.eligibilityErrors = []
          scope._respondToIncomeEligibilityResults(eligibility, error)
          expect(scope.eligibilityErrors).not.toEqual([])

        it 'tracks an income form error in analytics', ->
          scope._respondToIncomeEligibilityResults(eligibility, error)
          expect(fakeAnalyticsService.trackFormError).toHaveBeenCalledWith('Application', 'income too high', fakeIncomeOpts)


    describe 'clearEligibilityErrors', ->
      it 'empties scope.eligibilityErrors', ->
        scope.eligibilityErrors = ['some error message']
        scope.clearEligibilityErrors()
        expect(scope.eligibilityErrors).toEqual([])

    describe 'submitApplication', ->
      it 'calls submitApplication ShortFormApplicationService', ->
        scope.submitApplication()
        expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalledWith({finish: true})

    describe 'checkIfPreferencesApply', ->
      describe 'when household is eligible for Assisted Housing preference', ->
        it 'uses ShortFormNavigationService.goToApplicationPage to navigate to the Assisted Housing preference', ->
          fakeShortFormApplicationService.eligibleForAssistedHousing = jasmine.createSpy().and.returnValue(true)
          scope.checkIfPreferencesApply()
          path = 'dahlia.short-form-application.assisted-housing-preference'
          expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path)

      describe 'when household is not eligible for Assisted Housing preference', ->
        describe 'when household is eligible for Rent Burdened preference', ->
          it 'uses ShortFormNavigationService.goToApplicationPage to navigate to the Rent Burdened preference', ->
            fakeShortFormApplicationService.eligibleForAssistedHousing = jasmine.createSpy().and.returnValue(false)
            spyOn(fakeShortFormApplicationService, 'eligibleForRentBurden').and.returnValue(true)
            scope.checkIfPreferencesApply()
            path = 'dahlia.short-form-application.rent-burdened-preference'
            expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path)

        describe 'when household is not eligible for Rent Burdened preference', ->
          it 'calls $scope.checkForNeighborhoodOrLiveWork()', ->
            fakeShortFormApplicationService.eligibleForAssistedHousing = jasmine.createSpy().and.returnValue(false)
            spyOn(fakeShortFormApplicationService, 'eligibleForRentBurden').and.returnValue(false)
            scope.checkForNeighborhoodOrLiveWork = jasmine.createSpy()
            scope.checkIfPreferencesApply()
            expect(scope.checkForNeighborhoodOrLiveWork).toHaveBeenCalled()

    describe 'checkAfterLiveInTheNeighborhood', ->
      it 'goes to live-work-preference page if you did not select the preference', ->
        spyOn(fakeShortFormApplicationService, 'applicationHasPreference').and.returnValue(false)
        scope.checkAfterLiveInTheNeighborhood('neighborhoodResidence')
        path = 'dahlia.short-form-application.live-work-preference'
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path)

    describe 'checkAfterLiveWork', ->
      describe 'when listing has Alice Griffith preference', ->
        beforeEach ->
          spyOn(fakeShortFormApplicationService, 'applicationHasPreference').and.returnValue(true)
          spyOn(fakeShortFormApplicationService, 'listingHasRTRPreference').and.returnValue(true)

        it 'goes to right-to-return-preference', ->
          scope.checkAfterLiveWork()

          path = 'dahlia.short-form-application.right-to-return-preference'
          expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path)

      describe 'when listing does not have Alice Griffith preference', ->
        beforeEach ->
          spyOn(fakeShortFormApplicationService, 'applicationHasPreference').and.returnValue(false)
          spyOn(fakeShortFormApplicationService, 'listingHasRTRPreference').and.returnValue(false)

        it 'goes to preferences-programs page', ->
          scope.checkAfterLiveWork()
          path = 'dahlia.short-form-application.preferences-programs'
          expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path)

    describe 'saveAndFinishLater', ->
      describe 'logged in', ->
        beforeEach ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(true)
          scope.saveAndFinishLater(fakeEvent)
          $rootScope.$apply()

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
      it 'calls function on ShortFormApplicationService', ->
        scope.showPreference('liveInSf')
        expect(fakeShortFormApplicationService.showPreference).toHaveBeenCalledWith 'liveInSf'

    describe 'preferenceRequired', ->
      it 'calls function on ShortFormApplicationService', ->
        fakeShortFormApplicationService.showPreference = jasmine.createSpy().and.returnValue(true)
        scope.preferenceRequired('liveInSf')
        expect(fakeShortFormApplicationService.preferenceRequired).toHaveBeenCalledWith 'liveInSf'

    describe 'preferenceWarning', ->
      it 'calls inputInvalid with currentPreferenceType', ->
        spyOn(fakeShortFormApplicationService, 'inputInvalid')
        scope.form.currentPreferenceType = 'liveInSf'
        scope.preferenceWarning()
        expect(fakeShortFormApplicationService.inputInvalid).toHaveBeenCalled()

    describe 'primaryApplicantUnder18', ->
      it 'checks form values for primary applicant DOB that is under 18', ->
        spyOn(fakeShortFormApplicationService, 'memberAgeOnForm').and.returnValue(15)
        expect(scope.primaryApplicantUnder18()).toEqual true

      it 'checks form values for primary applicant DOB that is over 18', ->
        spyOn(fakeShortFormApplicationService, 'memberAgeOnForm').and.returnValue(25)
        expect(scope.primaryApplicantUnder18()).toEqual false

    describe 'householdMemberValidAge', ->
      it 'checks form values for household member age', ->
        year = new Date().getFullYear()
        scope.form.applicationForm.date_of_birth_year = {$viewValue: year}
        # due to "unborn child rule" 8-1-YYYY of current year should always be valid
        scope.householdMember.dob_month = 8
        scope.householdMember.dob_day = 1
        scope.householdMember.dob_year = year
        expect(scope.householdMemberValidAge()).toEqual true

    describe 'beginApplication', ->
      it 'expects fakeShortFormNavigationService.goToApplicationPage to be called with community screening page if listing is a community building', ->
        scope.listing.Reserved_community_type = 'Veteran'
        scope.listing.Custom_Listing_Type = null
        lang = 'en'
        scope.beginApplication(lang)
        path = 'dahlia.short-form-welcome.community-screening'
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path, {lang: lang})

      it 'expects fakeShortFormNavigationService.goToApplicationPage to be called with overview page and language param', ->
        scope.listing.Reserved_community_type = null
        scope.listing.Custom_Listing_Type = null
        lang = 'es'
        scope.beginApplication(lang)
        path = 'dahlia.short-form-welcome.overview'
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path, {lang: lang})

    describe 'validateCommunityEligibility', ->
      it 'expects fakeShortFormNavigationService.goToApplicationPage to be called with short form overview page if applicant answered Yes to screening question', ->
        scope.application.answeredCommunityScreening = 'Yes'
        scope.validateCommunityEligibility()
        path = 'dahlia.short-form-welcome.overview'
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path)

      it 'expects a community eligibility error if applicant answered No to screening question', ->
        scope.application.answeredCommunityScreening = 'No'
        scope.eligibilityErrors = []
        scope.communityEligibilityErrorMsg = ['At least one member of your household must be a Veteran']
        scope.validateCommunityEligibility()
        expect(scope.eligibilityErrors).toEqual scope.communityEligibilityErrorMsg

    describe 'checkForRentBurdenFiles', ->
      beforeEach ->
        fakeShortFormApplicationService.hasCompleteRentBurdenFiles = jasmine.createSpy()
        scope.checkForNeighborhoodOrLiveWork = jasmine.createSpy()
        scope.setRentBurdenError = jasmine.createSpy()
        scope.handleErrorState = jasmine.createSpy()

      describe 'with rent burden opted out', ->
        it 'calls $scope.checkForNeighborhoodOrLiveWork to determine next page', ->
          scope.preferences.optOut.rentBurden = true
          scope.checkForRentBurdenFiles()
          expect(scope.checkForNeighborhoodOrLiveWork).toHaveBeenCalled()

      describe 'with complete rent burden files', ->
        it 'calls $scope.checkForNeighborhoodOrLiveWork to determine next page', ->
          scope.preferences.optOut.rentBurden = false
          fakeShortFormApplicationService.hasCompleteRentBurdenFiles.and.returnValue(true)
          scope.checkForRentBurdenFiles()
          expect(scope.checkForNeighborhoodOrLiveWork).toHaveBeenCalled()

      describe 'with rent burden not opted out and with incomplete rent burden files', ->
        it 'sets the rent burden error and handles the error state', ->
          scope.preferences.optOut.rentBurden = false
          fakeShortFormApplicationService.hasCompleteRentBurdenFiles.and.returnValue(false)
          scope.checkForRentBurdenFiles()
          expect(scope.setRentBurdenError).toHaveBeenCalled()
          expect(scope.handleErrorState).toHaveBeenCalled()

    describe 'cancelRentBurdenFilesForAddress', ->
      it 'expects deleteRentBurdenPreferenceFiles to be called on Service', ->
        address = '123 Main St'
        scope.cancelRentBurdenFilesForAddress(address)
        expect(fakeRentBurdenFileService.deleteRentBurdenPreferenceFiles).toHaveBeenCalledWith(scope.listing.Id, address)

    describe 'hasCompleteRentBurdenFilesForAddress', ->
      it 'expects hasCompleteRentBurdenFilesForAddress to be called on Service', ->
        address = '123 Main St'
        scope.hasCompleteRentBurdenFilesForAddress(address)
        expect(fakeShortFormApplicationService.hasCompleteRentBurdenFilesForAddress).toHaveBeenCalledWith(address)

    describe 'cancelPreference', ->
      it 'clears rent burden error for rent burden preference', ->
        scope.customInvalidMessage = 'some value'
        scope.cancelPreference('rentBurden')
        expect(scope.customInvalidMessage).toEqual null

      it 'calls cancelPreference on ShortFormApplicationService', ->
        scope.cancelPreference()
        expect(fakeShortFormApplicationService.cancelPreference).toHaveBeenCalled()

    describe 'onStateChangeSuccess', ->
      it 'expects setApplicationLanguage to be called on ShortFormApplicationService', ->
        lang = 'es'
        toState = {name: 'state'}
        scope.onStateChangeSuccess(null, toState, {lang: lang})
        expect(fakeShortFormApplicationService.setApplicationLanguage).toHaveBeenCalledWith(lang)

      it 'expects isLoading to be set to false on ShortFormNavigationService', ->
        lang = 'es'
        toState = {name: 'state'}
        scope.onStateChangeSuccess(null, toState, {lang: lang})
        expect(fakeShortFormNavigationService.isLoading).toHaveBeenCalledWith(false)

    describe 'resetAndStartNewApp', ->
      beforeEach ->
        scope.resetAndStartNewApp()

      it 'calls resetApplicationData on ShortFormApplicationService', ->
        expect(fakeShortFormApplicationService.resetApplicationData).toHaveBeenCalled()

      it 'unsets application autofill value', ->
        expect(scope.application.autofill).toBeUndefined()

      it 'send user to first page of short form', ->
        expect(fakeShortFormNavigationService.initialState).toHaveBeenCalled()
        expect(state.go).toHaveBeenCalledWith('initialStatePage')

    describe 'checkForCustomPreferences', ->
      describe 'when listing does not have custom preferences', ->
        it 'calls $scope.checkForCustomProofPreferences', ->
          scope.listing.customPreferences = null
          scope.checkForCustomProofPreferences = jasmine.createSpy()
          scope.checkForCustomPreferences()
          expect(scope.checkForCustomProofPreferences).toHaveBeenCalled()

      describe 'when listing has custom preferences', ->
        it 'takes user to custom preferences page', ->
          scope.listing.customPreferences = [{preferenceName: 'customPreference', listingPreferenceID: '123456'}]
          scope.checkForCustomPreferences()
          expect(fakeShortFormNavigationService.goToApplicationPage)
            .toHaveBeenCalledWith('dahlia.short-form-application.custom-preferences')

    describe 'checkForCustomProofPreferences', ->
      beforeEach ->
        scope.listing.customProofPreferences = ['pref1', 'pref2']

      describe 'checking custom proof preferences for the first time', ->
        it 'sends user to custom proof pref page with index 0', ->
          state.params.prefIdx = NaN
          scope.checkForCustomProofPreferences()
          path = 'dahlia.short-form-application.custom-proof-preferences'
          expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path, {prefIdx: 0})

      describe 'paging thru custom preferences', ->
        it 'sends user to custom proof pref page with the subsequent index', ->
          state.params.prefIdx = 0
          scope.checkForCustomProofPreferences()
          path = 'dahlia.short-form-application.custom-proof-preferences'
          expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path, {prefIdx: 1})

      describe 'at last page of custom preferences', ->
        it 'checks if there are no preferences selected', ->
          state.params.prefIdx = 1
          scope.checkIfNoPreferencesSelected = jasmine.createSpy()
          scope.checkForCustomProofPreferences()
          expect(scope.checkIfNoPreferencesSelected).toHaveBeenCalled()

    describe 'checkAliceGriffithAddress', ->
      beforeEach ->
        fakeShortFormApplicationService.preferences.aliceGriffith_address = {
          address1: '1234 Main St.'
          address2: 'Apt 3'
          city: 'San Francisco'
          state: 'CA'
          zip: '94114'
        }

      describe 'when preference not claimed', ->
        beforeEach ->
          fakeShortFormApplicationService.preferences.aliceGriffith = null

        it 'should proceed directly to preferences programs page', ->
          scope.checkAliceGriffithAddress()

          expect(fakeShortFormNavigationService.goToApplicationPage)
            .toHaveBeenCalledWith('dahlia.short-form-application.preferences-programs')

      describe 'when preference claimed and address not verified', ->
        beforeEach ->
          fakeShortFormApplicationService.preferences.aliceGriffith = true
          scope.application.aliceGriffith_address_verified = false
          scope.application.validatedForms.Preferences['verify-alice-griffith-address'] = false

        it 'should validate Alice Griffith address', ->
          scope.checkAliceGriffithAddress()

          expect(fakeAddressValidationService.validate).toHaveBeenCalledWith({
            address: fakeShortFormApplicationService.preferences.aliceGriffith_address
            type: 'home'
          })

        it 'should go to verify address page address when verification successful', ->
          scope.checkAliceGriffithAddress()
          $rootScope.$apply()

          expect(scope.application.aliceGriffith_address_verified).toEqual(true)
          expect(fakeShortFormNavigationService.goToApplicationPage)
            .toHaveBeenCalledWith('dahlia.short-form-application.alice-griffith-verify-address')

        it 'should display address errors when verification unsuccessful', ->
          spyOn(scope, 'handleErrorState').and.callThrough()

          deferred = $q.defer()
          deferred.reject({ status: 422 })
          fakeAddressValidationService.validate.and.returnValue(deferred.promise)

          scope.checkAliceGriffithAddress()
          $rootScope.$apply()

          expect(scope.application.aliceGriffith_address_verified).toEqual(false)
          expect(scope.addressError).toEqual(true)
          expect(scope.handleErrorState).toHaveBeenCalled()


        it 'should go to preferences programs page when verification errors', ->
          deferred = $q.defer()
          deferred.reject({ status: 500 })
          fakeAddressValidationService.validate.and.returnValue(deferred.promise)

          scope.checkAliceGriffithAddress()
          $rootScope.$apply()

          expect(scope.application.aliceGriffith_address_verified).toEqual(false)
          expect(fakeShortFormNavigationService.goToApplicationPage)
            .toHaveBeenCalledWith('dahlia.short-form-application.preferences-programs')

      describe 'when preference claimed and address is already verified', ->
        beforeEach ->
          fakeShortFormApplicationService.preferences.aliceGriffith = true
          scope.application.aliceGriffith_address_verified = true
          scope.application.validatedForms.Preferences['verify-alice-griffith-address'] = true

        it 'should proceed directly to preferences programs page', ->
          scope.checkAliceGriffithAddress()

          expect(fakeShortFormNavigationService.goToApplicationPage)
            .toHaveBeenCalledWith('dahlia.short-form-application.preferences-programs')

    describe 'chooseDraft', ->
      describe 'when user has chosen their recent application', ->
        beforeEach ->
          scope.chosenApplicationToKeep = 'recent'
          user = {test: 'test'}
          fakeAccountService.loggedInUser = user

        describe "when user's account info differs from the applicant info on their recent application", ->
          it 'sends user to choose application details', ->
            spyOn(fakeShortFormApplicationService, 'hasDifferentInfo').and.returnValue(true)
            scope.chooseDraft()
            expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith('dahlia.short-form-application.choose-applicant-details')

        describe "when user's account info is the same as the applicant info on their recent application", ->
          it 'calls ShortFormApplicationService.keepCurrentDraftApplication with the logged-in user', ->
            scope.chooseDraft()
            expect(fakeShortFormApplicationService.keepCurrentDraftApplication).toHaveBeenCalledWith(fakeAccountService.loggedInUser)

          it 'calls scope.goToApplicationPage to go to My Applications, skipping the confirm modal', ->
            scope.chooseDraft()
            $rootScope.$apply()
            expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith('dahlia.my-applications', {skipConfirm: true})

      describe 'when user has chosen their saved draft', ->
        it 'calls scope.goToApplicationPage to go to My Applications, skipping the confirm modal', ->
          scope.chosenApplicationToKeep = 'comparison'
          scope.chooseDraft()
          expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith('dahlia.my-applications', {skipConfirm: true})

    describe 'chooseApplicantDetails', ->
      describe 'when user chooses to create account', ->
        it 'signs out user and sends them to create account page', ->
          scope.applicant.id = 1
          scope.chosenAccountOption = 'createAccount'
          scope.chooseApplicantDetails()
          scope.$apply()
          expect(fakeAccountService.signOut).toHaveBeenCalledWith({ preserveAppData: true })
          expect(fakeShortFormApplicationService.storeLastPage).toHaveBeenCalledWith('name')
          expect(fakeShortFormApplicationService.cancelPreferencesForMember)
            .toHaveBeenCalledWith(scope.applicant.id)
          expect(fakeShortFormApplicationService.resetCompletedSections).toHaveBeenCalled()
          expect(fakeShortFormNavigationService.goToApplicationPage)
            .toHaveBeenCalledWith('dahlia.short-form-application.create-account')

      describe 'when user chooses to continue as guest', ->
        it 'signs out user and sends them to the last page of the app', ->
          scope.application.lastPage = 'name'
          scope.chosenAccountOption = 'continueAsGuest'
          scope.chooseApplicantDetails()
          scope.$apply()
          expect(fakeAccountService.signOut).toHaveBeenCalledWith({ preserveAppData: true })
          expect(fakeShortFormNavigationService.goToApplicationPage)
            .toHaveBeenCalledWith('dahlia.short-form-application.contact')

      describe 'when user chooses to overwrite account info', ->
        beforeEach ->
          fakeAccountService.loggedInUser = {test: 'test'}
          scope.applicant.id = 1
          scope.chosenAccountOption = 'overwriteWithAccountInfo'
          scope.chooseApplicantDetails()
          scope.$apply()

        it 'calls function to cancel preferences by the member', ->
          expect(fakeShortFormApplicationService.cancelPreferencesForMember).toHaveBeenCalledWith(1)

        it 'calls function to reset completed sections', ->
          expect(fakeShortFormApplicationService.resetCompletedSections).toHaveBeenCalled()

        it 'should overwrite previous draft application', ->
          expect(fakeShortFormApplicationService.keepCurrentDraftApplication).toHaveBeenCalled()

        it 'sends user to name section of the short form', ->
          expect(fakeShortFormNavigationService.goToApplicationPage)
            .toHaveBeenCalledWith('dahlia.short-form-application.name')

    describe 'signIn', ->
      beforeEach ->
        scope.form.signIn = {
          $valid: true
          $setUntouched: ->
          $setPristine: ->
        }

      it 'should sign in user', ->
        scope.signIn()
        expect(fakeAccountService.signIn).toHaveBeenCalled()

      describe 'when sign in request successful', ->
        it 'should re-enable submit button and call sign in actions', ->
          scope.afterSignInWhileApplying = jasmine.createSpy()

          scope.signIn()
          $rootScope.$apply()

          expect(scope.submitDisabled).toBe(false)
          expect(scope.afterSignInWhileApplying).toHaveBeenCalled()

      describe 'when sign in request fails', ->
        it 'should re-enable submit button handle errors', ->
          scope.handleErrorState = jasmine.createSpy()

          deferred = $q.defer()
          deferred.reject()
          fakeAccountService.signIn.and.returnValue(deferred.promise)

          scope.signIn()
          $rootScope.$apply()

          expect(scope.submitDisabled).toBe(false)
          expect(scope.handleErrorState).toHaveBeenCalled()

    describe 'afterSignInWhileApplying', ->
      describe 'when senior requirements AND when account birth date doesn\'t qualify', ->
        it 'should sign out and redirect ', ->
          spyOn(fakeShortFormApplicationService,
            'applicantDoesNotmeetAllSeniorBuildingRequirements').and.returnValue(true)

          scope.afterSignInWhileApplying()

          expect(fakeAccountService.signOut).toHaveBeenCalledWith({ preserveAppData: true })
          expect(fakeShortFormApplicationService.addSeniorEligibilityError).toHaveBeenCalled()
          expect(state.go)
            .toHaveBeenCalledWith('dahlia.short-form-application.choose-applicant-details')

      describe 'when no senior requirements OR account birth date does qualify', ->
        it 'should load previous application(s)', ->
          spyOn(fakeShortFormApplicationService,
            'applicantDoesNotmeetAllSeniorBuildingRequirements').and.returnValue(false)
          deferred = $q.defer()
          deferred.resolve()
          scope.getPrevAppData = jasmine.createSpy().and.returnValue(deferred.promise)
          scope.reconcilePreviousAppOrSubmit = jasmine.createSpy()

          scope.afterSignInWhileApplying()
          $rootScope.$apply()

          expect(scope.getPrevAppData).toHaveBeenCalled()
          expect(scope.reconcilePreviousAppOrSubmit).toHaveBeenCalled()

    describe 'getPrevAppData', ->
      describe 'when prev app request successful', ->
        it 'returns response data', ->
          data = 'my app!'
          promiseResult = undefined
          deferred = $q.defer()
          deferred.resolve({ data })
          spyOn(fakeShortFormApplicationService, 'getMyApplicationForListing')
            .and.returnValue(deferred.promise)

          promise = scope.getPrevAppData()
          promise.then (data) ->
            promiseResult = data
          $rootScope.$apply()

          expect(promiseResult).toBe(data)

      describe 'when prev app request fails', ->
        it 'redirects to name page of application', ->
          deferred = $q.defer()
          deferred.reject()
          spyOn(fakeShortFormApplicationService, 'getMyApplicationForListing')
            .and.returnValue(deferred.promise)
          spyOn(window, 'alert')

          scope.getPrevAppData()
          $rootScope.$apply()

          expect(window.alert).toHaveBeenCalled()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.name',
            { id: fakeListing.Id })

    describe 'reconcilePreviousAppOrSubmit', ->
      describe 'when user has previous application', ->
        describe 'when previous app is submitted', ->
          appId = '0987654321'
          previousAppData = {
            application: {
              id: appId
              status: 'submitted'
            }
          }

          describe 'when current app is draft', ->
            it 'should redirect to my applications with already submitted message', ->
              scope.reconcilePreviousAppOrSubmit(previousAppData)

              expect(state.go).toHaveBeenCalledWith('dahlia.my-applications', {
                skipConfirm: true
                alreadySubmittedId: appId
                doubleSubmit: false
              })

          describe 'when current app is submitted', ->
            beforeAll ->
              fakeShortFormApplicationService.application.status = 'submitted'

            afterAll ->
              fakeShortFormApplicationService.application.status = 'draft'

            it 'should redirect to my application with double submit message', ->
              scope.reconcilePreviousAppOrSubmit(previousAppData)

              expect(state.go).toHaveBeenCalledWith('dahlia.my-applications', {
                skipConfirm: true
                alreadySubmittedId: appId
                doubleSubmit: true
              })

      describe 'when previous app is draft', ->
        previousAppData = {
          application: {
            status: 'draft'
          }
        }

        describe 'when on welcome back page', ->
          beforeEach ->
            state.current.name = 'dahlia.short-form-application.welcome-back'

          afterEach ->
            state.current.name = 'dahlia.short-form-welcome.overview'

          it 'should replace current app with previous and continue draft', ->
            scope.replaceAppWithPreviousDraft = jasmine.createSpy()

            scope.reconcilePreviousAppOrSubmit(previousAppData)

            expect(scope.replaceAppWithPreviousDraft).toHaveBeenCalledWith(previousAppData)
            expect(state.go)
              .toHaveBeenCalledWith('dahlia.short-form-application.continue-previous-draft')

        describe 'when not on welcome back page', ->
          beforeEach ->
            state.current.name = 'dahlia.short-form-application.overview'

          it 'should redirect to choose draft', ->
            scope.reconcilePreviousAppOrSubmit(previousAppData)

            expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.choose-draft')

      describe 'when user does not have previous application', ->
        previousAppData = {}
        infoChanged = {
          firstName: 'Johnny'
          lastName: 'Appleseed'
        }

        beforeEach ->
          fakeShortFormApplicationService.importUserData.and.returnValue(infoChanged)

        describe 'when not on welcome back page', ->
          it 'submits current app and redirects to my applications', ->
            scope.reconcilePreviousAppOrSubmit(previousAppData)
            $rootScope.$apply()

            expect(state.go).toHaveBeenCalledWith('dahlia.my-applications',
              { skipConfirm: true, infoChanged })

        describe 'when on welcome back page', ->
          beforeEach ->
            state.current.name = 'dahlia.short-form-application.welcome-back'

          afterEach ->
            state.current.name = 'dahlia.short-form-welcome.overview'

          it 'redirects to name page', ->
            scope.reconcilePreviousAppOrSubmit(previousAppData)
            $rootScope.$apply()

            expect(fakeShortFormNavigationService.goToApplicationPage)
              .toHaveBeenCalledWith('dahlia.short-form-application.name', { infoChanged })

    describe 'replaceAppWithPreviousDraft', ->
      previousAppData = { id: '0987654321' }

      it 'should load previous app and reset completed sections', ->
        scope.replaceAppWithPreviousDraft(previousAppData)

        expect(fakeShortFormApplicationService.loadApplication)
          .toHaveBeenCalledWith(previousAppData)
        expect(fakeShortFormApplicationService.resetCompletedSections).toHaveBeenCalled()

    describe 'listingIsRental', ->
      it 'should call listingIsRental on ShortFormApplicationService', ->
        scope.listingIsRental()
        expect(fakeShortFormApplicationService.listingIsRental)
          .toHaveBeenCalled()

    describe 'listingIsSale', ->
      it 'should call listingIsSale on ShortFormApplicationService', ->
        scope.listingIsSale()
        expect(fakeShortFormApplicationService.listingIsSale)
          .toHaveBeenCalled()

    describe 'custom educator listing 2', ->
      beforeEach ->
        scope.listing.Custom_Listing_Type = 'Educator 2: SFUSD employees & public'

      it 'shows the custom educator screening page', ->
        lang = 'en'
        scope.beginApplication(lang)
        path = 'dahlia.short-form-welcome.custom-educator-screening'
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path, {lang: lang})

      it 'shows the short form overview page if applicant answered Yes to the screening question', ->
        scope.application.customEducatorScreeningAnswer = 'Yes'
        scope.customEducatorValidateEligibility()
        path = 'dahlia.short-form-welcome.overview'
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path)

      it 'shows the short form overview page if applicant answered No to the screening question', ->
        scope.application.customEducatorScreeningAnswer = 'No'
        scope.customEducatorValidateEligibility()
        path = 'dahlia.short-form-welcome.overview'
        expect(fakeShortFormNavigationService.goToApplicationPage).toHaveBeenCalledWith(path)
