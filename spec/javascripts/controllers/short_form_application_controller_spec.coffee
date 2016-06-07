do ->
  'use strict'
  describe 'ShortFormApplicationController', ->
    scope = undefined
    state = undefined
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeShortFormApplicationService =
      applicant: {}
      application: {}
      alternateContact: {}
      householdMember: {
        first_name: "Oberon"
      }
      copyHomeToMailingAddress: jasmine.createSpy()
      addHouseholdMember: jasmine.createSpy()
      cancelHouseholdMember: jasmine.createSpy()
      refreshLiveWorkPreferences: jasmine.createSpy()
      liveInSfMembers: jasmine.createSpy()
      workInSfMembers: jasmine.createSpy()
      validMailingAddress: ->
        true
    fakeShortFormNavigationService =
      sections: []
      hasNav: jasmine.createSpy()
    fakeShortFormHelperService = {}
    fakeAddressValidationService =
      isDeliverable: jasmine.createSpy()

    beforeEach module('dahlia.controllers', ($provide) ->
      fakeListingService =
        listing: fakeListing
      $provide.value 'ListingService', fakeListingService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      state = jasmine.createSpyObj('$state', ['go'])
      state.current = {name: 'dahlia.short-form-application.overview'}
      translate = {}

      $controller 'ShortFormApplicationController',
        $scope: scope
        $state: state
        $translate: translate
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
          scope.alternateContact.type = 'None'
          scope.checkIfAlternateContactInfoNeeded()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.household-intro')
          return
        return

      describe 'Alternate contact type indicated', ->
        it 'navigates ahead to alt contact name page', ->
          scope.alternateContact.type = 'Friend'
          scope.checkIfAlternateContactInfoNeeded()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.alternate-contact-name')
          return
        return

    describe '$scope.checkIfMailingAddressNeeded', ->
      describe 'separateAddress unchecked', ->
        it 'calls Service function to copy home address to mailing', ->
          scope.applicant.separateAddress = false
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
      it 'calls isDeliverable in AddressValidationService', ->
        scope.validated_home_address = {street1: 'x'}
        scope.addressFailedValidation('home_address')
        expect(fakeAddressValidationService.isDeliverable).toHaveBeenCalled()
        return

    describe '$scope.addressInputInvalid', ->
      it 'calls isDeliverable in AddressValidationService', ->
        scope.validated_home_address = {street1: 'x'}
        scope.addressInputInvalid('home_address')
        expect(fakeAddressValidationService.isDeliverable).toHaveBeenCalled()
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
  return
