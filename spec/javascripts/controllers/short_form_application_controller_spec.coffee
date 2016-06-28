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
    fakeShortFormApplicationService =
      form: {}
      applicant: {}
      application: {}
      alternateContact: {}
      householdMember: {
        firstName: "Oberon"
      }
      isWelcomePage: jasmine.createSpy()
      copyHomeToMailingAddress: jasmine.createSpy()
      addHouseholdMember: jasmine.createSpy()
      cancelHouseholdMember: jasmine.createSpy()
      refreshLiveWorkPreferences: jasmine.createSpy()
      liveInSfMembers: jasmine.createSpy()
      workInSfMembers: jasmine.createSpy()
      clearAlternateContactDetails: jasmine.createSpy()
      checkHouseholdEligiblity: (listing) ->
        return
      submitApplication: (listing) ->
        return
      validMailingAddress: ->
        true
    fakeFunctions =
      fakeGetLandingPage: (section, application) ->
        'household-intro'
    fakeShortFormNavigationService = {}
    fakeShortFormNavigationService =
      sections: []
      hasNav: jasmine.createSpy()
    fakeShortFormHelperService = {}
    fakeAddressValidationService =
      failedValidation: jasmine.createSpy()

    beforeEach module('dahlia.controllers', ($provide) ->
      fakeListingService =
        listing: fakeListing
      fakeShortFormNavigationService =
        sections: []
        hasNav: jasmine.createSpy()
        getLandingPage: spyOn(fakeFunctions, 'fakeGetLandingPage').and.callThrough()

      $provide.value 'ListingService', fakeListingService
      return
    )

    beforeEach inject(($rootScope, $controller, $q) ->
      scope = $rootScope.$new()
      state = jasmine.createSpyObj('$state', ['go'])
      fakeIdle = jasmine.createSpyObj('Idle', ['watch'])
      fakeTitle = jasmine.createSpyObj('Title', ['restore'])
      state.current = {name: 'dahlia.short-form-welcome.overview'}

      $translate = {
        instant: jasmine.createSpy('$translate.instant').and.returnValue('newmessage')
      }

      deferred = $q.defer()
      deferred.resolve('resolveData')
      spyOn(fakeShortFormApplicationService, 'checkHouseholdEligiblity').and.returnValue(deferred.promise)
      spyOn(fakeShortFormApplicationService, 'submitApplication').and.returnValue(deferred.promise)

      $controller 'ShortFormApplicationController',
        $scope: scope
        $state: state
        Idle: fakeIdle
        Title: fakeTitle
        $translate: $translate
        ShortFormApplicationService: fakeShortFormApplicationService
        ShortFormNavigationService: fakeShortFormNavigationService
        ShortFormHelperService: fakeShortFormHelperService
        AddressValidationService: fakeAddressValidationService
      return
    )

    describe '$scope.listing', ->
      it 'populates scope with a single listing', ->
        expect(scope.listing).toEqual fakeListing
        return
      return

    describe '$scope.hasNav', ->
      it 'calls function on navService', ->
        scope.hasNav()
        expect(fakeShortFormNavigationService.hasNav).toHaveBeenCalled()
        return
      return

    describe '$scope.checkIfAlternateContactInfoNeeded', ->
      describe 'No alternate contact indicated', ->
        it 'navigates ahead to optional info', ->
          scope.alternateContact.alternateContactType = 'None'
          scope.checkIfAlternateContactInfoNeeded()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.household-intro')
          return

        it 'calls clearAlternateContactDetails from ShortFormApplicationService', ->
          scope.alternateContact.alternateContactType = 'None'
          scope.checkIfAlternateContactInfoNeeded()
          expect(fakeShortFormApplicationService.clearAlternateContactDetails).toHaveBeenCalled()
          return
        return

      describe 'Alternate contact type indicated', ->
        it 'navigates ahead to alt contact name page', ->
          scope.alternateContact.alternateContactType = 'Friend'
          scope.checkIfAlternateContactInfoNeeded()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.alternate-contact-name')
          return
        return

    describe '$scope.checkIfMailingAddressNeeded', ->
      describe 'hasAltMailingAddress unchecked', ->
        it 'calls Service function to copy home address to mailing', ->
          scope.applicant.hasAltMailingAddress = false
          scope.checkIfMailingAddressNeeded()
          expect(fakeShortFormApplicationService.copyHomeToMailingAddress).toHaveBeenCalled()
          return
        return

    describe '$scope.getHouseholdMember', ->
      it 'assigns $scope.householdMember with ShortFormApplicationService value', ->
        scope.householdMember = {}
        scope.getHouseholdMember()
        expect(scope.householdMember).toEqual(fakeShortFormApplicationService.householdMember)
        return

    describe '$scope.addHouseholdMember', ->
      it 'calls addHouseholdMember in ShortFormApplicationService', ->
        scope.addHouseholdMember()
        expect(fakeShortFormApplicationService.addHouseholdMember).toHaveBeenCalledWith(scope.householdMember)
        return

    describe '$scope.cancelHouseholdMember', ->
      it 'calls cancelHouseholdMember in ShortFormApplicationService', ->
        scope.cancelHouseholdMember()
        expect(fakeShortFormApplicationService.cancelHouseholdMember).toHaveBeenCalled()
        return

      it 'navigates to household members index', ->
        scope.cancelHouseholdMember()
        expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.household-members')
        return

    describe '$scope.addressFailedValidation', ->
      it 'calls failedValidation in AddressValidationService', ->
        scope.validated_home_address = {street1: 'x'}
        scope.addressFailedValidation('home_address')
        expect(fakeAddressValidationService.failedValidation).toHaveBeenCalled()
        return

    describe '$scope.addressInputInvalid', ->
      it 'calls failedValidation in AddressValidationService', ->
        scope.form = {applicationForm: {}}
        scope.validated_home_address = {street1: 'x'}
        scope.addressInputInvalid('home_address')
        expect(fakeAddressValidationService.failedValidation).toHaveBeenCalled()
        return

    describe '$scope.checkIfAddressVerificationNeeded', ->
      describe 'No address verification indicated', ->
        it 'navigates ahead to alt contact type', ->
          scope.applicant.noAddress = true
          scope.checkIfAddressVerificationNeeded()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.alternate-contact-type')
          return
        return

      describe 'Alternate contact type indicated', ->
        it 'navigates ahead to verify address page', ->
          scope.applicant.noAddress = false
          scope.checkIfAddressVerificationNeeded()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.verify-address')
          return
        return

    describe 'Idle.watch()', ->
      it 'expects Idle.watch() to be called on initialization', ->
        expect(fakeIdle.watch).toHaveBeenCalled()

    describe '$scope.getLandingPage', ->
      it 'calls getLandingPage in ShortFormNavigationService', ->
        scope.getLandingPage({name: 'Household'})
        expect(fakeShortFormNavigationService.getLandingPage).toHaveBeenCalled()
        return
      return

    describe '$scope.checkLiveWorkEligibility', ->
      it 'calls refreshLiveWorkPreferences in ShortFormApplicationService', ->
        scope.checkLiveWorkEligibility()
        expect(fakeShortFormApplicationService.refreshLiveWorkPreferences).toHaveBeenCalled()
        return

    describe '$scope.liveInSfMembers', ->
      it 'calls liveInSfMembers in ShortFormApplicationService', ->
        scope.liveInSfMembers()
        expect(fakeShortFormApplicationService.liveInSfMembers).toHaveBeenCalled()
        return

    describe '$scope.workInSfMembers', ->
      it 'calls liveInSfMembers in ShortFormApplicationService', ->
        scope.workInSfMembers()
        expect(fakeShortFormApplicationService.workInSfMembers).toHaveBeenCalled()
        return

    describe 'validateHouseholdEligibility', ->
      it 'calls checkHouseholdEligiblity in ShortFormApplicationService', ->

        match = 'householdMatch'
        callbackUrl = 'someUrl'
        scope.listing = fakeListing

        scope.validateHouseholdEligibility(match, callbackUrl)
        expect(fakeShortFormApplicationService.checkHouseholdEligiblity).toHaveBeenCalledWith(fakeListing)
        return
      return

    describe '_respondToHouseholdEligibilityResults', ->
      describe 'matched', ->
        #replace with a jasmine fixture
        beforeEach ->
          eligibilityResponse =
            data: validHousehold
          callbackUrl = 'someUrl'
          return

        it 'reset the eligibility error message', ->
          scope.householdEligibilityErrorMessage = 'Error'
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch', callbackUrl)
          expect(scope.householdEligibilityErrorMessage).toEqual(null)
          return

        it 'navigates to the given callback url', ->
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch', callbackUrl)
          expect(state.go).toHaveBeenCalledWith(callbackUrl)
          return
        return

      describe 'not matched', ->
        beforeEach ->
          eligibilityResponse =
            data: invalidHousehold
          callbackUrl = 'someUrl'
          return

        it 'updates the scope that shows the alert', ->
          scope.hideAlert = true
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch', callbackUrl)
          expect(scope.hideAlert).toEqual(false)
          return

        it 'assigns an error message function', ->
          scope.householdEligibilityErrorMessage  = null
          scope._respondToHouseholdEligibilityResults(eligibilityResponse, 'householdMatch', callbackUrl)
          expect(scope.householdEligibilityErrorMessage).toEqual('newmessage')
          return
        return
      return

    describe 'clearHouseholdErrorMessage', ->
      it 'assigns scope.householdEligibilityErrorMessage to null', ->
        scope.householdEligibilityErrorMessage = 'some error message'
        scope.clearHouseholdErrorMessage()
        expect(scope.householdEligibilityErrorMessage).toEqual(null)
        return
      return

    describe 'submitApplication', ->
      it 'calls submitApplication ShortFormApplicationService', ->
        scope.listing = fakeListing
        scope.submitApplication(scope.listing.Id)
        expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalledWith(fakeListing.Id)
        return
      return
  return















>>>>>>> [#108846424] - Shortform - wrote submit application test
