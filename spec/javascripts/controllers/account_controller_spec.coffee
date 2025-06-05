do ->
  'use strict'
  describe 'AccountController', ->
    scope = undefined
    state = {current: {name: 'dahlia'}, params: {fromShortFormIntro: null}}
    deferred = undefined
    $translate =
      instant: jasmine.createSpy()
    fakeAnalyticsService =
      trackFormSuccess: jasmine.createSpy()
      trackFormError: jasmine.createSpy()
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeUser =
      email: 'email@test.com'
    fakeAccountService =
      userAuth: {user: fakeUser}
      createAccount: ->
      signIn: ->
      loggedIn: ->
      updatePassword: ->
      updateAccount: ->
      resendConfirmationEmail: ->
      requestPasswordReset: ->
      goToLoginRedirect: jasmine.createSpy()
      accountError: {messages: ''}
      accountSuccess: {messages: ''}
      userDataForContact: ->
        firstName: 'X'
        lastName: 'Y'
        email: 'x@y.com'
      DOBUnder18: ->
    fakeShortFormApplicationService =
      importUserData: -> null
      submitApplication: -> null
      signInSubmitApplication: -> null
    fakeSharedService = {}
    fakeModalService =
      closeModal: jasmine.createSpy()
    fakeListingIdentityService =
      isSale: ->
    fakeApplication = {
      listing: fakeListing
    }
    fakeIsSale = false

    beforeEach module('dahlia.controllers', ($provide) ->
      $provide.value '$translate', $translate
      return
    )

    beforeEach inject(($rootScope, $controller, $q) ->
      scope = $rootScope.$new()
      scope.form =
        signIn: {}
        createAccount: {}
        passwordReset: {}
      state.go = jasmine.createSpy()
      deferred = $q.defer()
      fakeHttp =
        success: (callback) ->
          callback({})
          { error: -> return }
        then: (callback) ->
          callback({})
          { catch: -> return }
        error: (callback) -> callback({})
      spyOn(fakeAccountService, 'createAccount').and.returnValue(deferred.promise)
      spyOn(fakeAccountService, 'signIn').and.returnValue(deferred.promise)
      spyOn(fakeAccountService, 'updatePassword').and.returnValue(deferred.promise)
      spyOn(fakeAccountService, 'updateAccount').and.returnValue(deferred.promise)
      spyOn(fakeAccountService, 'resendConfirmationEmail').and.returnValue(deferred.promise)
      spyOn(fakeAccountService, 'requestPasswordReset').and.returnValue(deferred.promise)
      spyOn(fakeShortFormApplicationService, 'importUserData').and.returnValue(false)
      spyOn(fakeShortFormApplicationService, 'submitApplication').and.returnValue(deferred.promise)
      spyOn(fakeShortFormApplicationService, 'signInSubmitApplication').and.returnValue(deferred.promise)

      $controller 'AccountController',
        $scope: scope
        $state: state
        AccountService: fakeAccountService
        AnalyticsService: fakeAnalyticsService
        ShortFormApplicationService: fakeShortFormApplicationService
        SharedService: fakeSharedService
        ModalService: fakeModalService
        inputMaxLength: {}
        ListingIdentityService: fakeListingIdentityService
    )

    describe '$scope.closeModal', ->
      it 'calls ModalService.closeModal', ->
        scope.closeModal()
        expect(fakeModalService.closeModal).toHaveBeenCalled()

    describe '$scope.closeAlert', ->
      beforeEach ->
        scope.closeModal = jasmine.createSpy()
        scope.closeAlert()

      it 'calls scope.closeModal', ->
        expect(scope.closeModal).toHaveBeenCalled()

      it 'sets scope.hideAlert to true', ->
        expect(scope.hideAlert).toEqual(true)

    describe '$scope.createAccount', ->
      beforeEach ->
        scope.form.createAccount =
          $valid: true
          $setUntouched: () ->
          $setPristine: () ->

      it 'calls function on AccountService', ->
        scope.createAccount()
        expect(fakeAccountService.createAccount).toHaveBeenCalled()

      describe 'user in short form session', ->
        beforeEach ->
          scope.form.createAccount =
            $valid: true
            $setUntouched: () ->
            $setPristine: () ->
          fakeShortFormApplicationService.session_uid = 'someuid'
          state.current.name = 'dahlia.short-form-application.create-account'
          deferred.resolve(true)

        it 'calls createAccount function on account service with shortFormSession data', ->
          expectedArgument = {uid: 'someuid'}
          scope.createAccount()
          expect(fakeAccountService.createAccount).toHaveBeenCalledWith(expectedArgument)

        it 'submits application as draft ', ->
          scope.createAccount()
          scope.$apply()
          expectedArgument = {attachToAccount: true}
          expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalledWith(expectedArgument)

        it 'routes user to sign-in', ->
          scope.createAccount()
          scope.$apply()
          expect(state.go).toHaveBeenCalledWith('dahlia.sign-in', {skipConfirm: true, newAccount: true})

    describe '$scope.signIn', ->
      beforeEach ->
        scope.form.signIn =
          $valid: true
          $setUntouched: () ->
          $setPristine: () ->
        deferred.resolve(true)

      it 'calls function on AccountService', ->
        scope.signIn()
        expect(fakeAccountService.signIn).toHaveBeenCalled()

      it 'disables the submit button when signIn is called', ->
        scope.signIn()
        expect(scope.submitDisabled).toEqual true

      describe "when user came to the sign in page from a listing's short form intro page", ->
        beforeEach ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(true)
          state.current.name = 'dahlia.sign-in'
          state.params.fromShortFormIntro = true
          fakeShortFormApplicationService.listing =
            Id: '123'

        it 'sends user back to short form intro page', ->
          scope.signIn()
          scope.$apply()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-welcome.intro', {id: '123'})

      describe 'when user did not come to the sign in page from the short form intro page', ->
        beforeEach ->
          state.params.fromShortFormIntro = null

        describe 'when user is signing in from the continue draft page', ->
          it 'sends the user to the short form name page', ->
            state.current.name = 'dahlia.continue-draft-sign-in'
            listing_id = '123'
            state.params.listing_id = listing_id
            scope.signIn()
            scope.$apply()
            expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.name', id: listing_id)

        describe 'when user is not signing in from the continue draft page', ->
          it 'calls scope._signInRedirect', ->
            state.current.name = 'dahlia.sign-in'
            scope._signInRedirect = jasmine.createSpy()
            scope.signIn()
            scope.$apply()
            expect(scope._signInRedirect).toHaveBeenCalled()

    describe '$scope.requestPasswordReset', ->
      it 'calls on AccountService.requestPasswordReset', ->
        scope.form.passwordReset = {$valid: true}
        scope.requestPasswordReset()
        expect(fakeAccountService.requestPasswordReset).toHaveBeenCalled()

    describe '$scope.updatePassword', ->
      it 'calls AccountService.updatePassword', ->
        scope.form.accountPassword = {$valid: true}
        scope.updatePassword('reset')
        expect(fakeAccountService.updatePassword).toHaveBeenCalled()

    describe '$scope.updateEmail', ->
      it 'calls AccountService.updateAccount', ->
        scope.form.accountEmail = {$valid: true}
        scope.updateEmail()
        expect(fakeAccountService.updateAccount).toHaveBeenCalledWith('email')

    describe '$scope.updateNameDOB', ->
      it 'calls AccountService.updateAccount', ->
        scope.form.accountNameDOB = {$valid: true}
        scope.updateNameDOB()
        expect(fakeAccountService.updateAccount).toHaveBeenCalledWith('nameDOB')

    describe '$scope.resendConfirmationEmail', ->
      it 'calls AccountService.resendConfirmationEmail', ->
        scope.resendConfirmationEmail()
        expect(fakeAccountService.resendConfirmationEmail).toHaveBeenCalled()

    describe '$scope._createAccountSubmitApplication', ->
      it 'calls ShortFormApplicationService.importUserData', ->
        scope._createAccountSubmitApplication()
        expect(fakeShortFormApplicationService.importUserData).toHaveBeenCalled()
      it 'calls ShortFormApplicationService.importUserData', ->
        scope._createAccountSubmitApplication()
        expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalled()

    describe '$scope.DOBUnder18', ->
      it 'calls AccountService.DOBUnder18 with expected values', ->
        fakeAccountForm = {
          'date_of_birth_year': {$viewValue: 'year'},
          'date_of_birth_month': {$viewValue: 'month'},
          'date_of_birth_day': {$viewValue: 'day'},
        }
        spyOn(scope, 'accountForm').and.returnValue(fakeAccountForm)
        spyOn(fakeAccountService, 'DOBUnder18')
        scope.DOBUnder18()
        expect(fakeAccountService.DOBUnder18).toHaveBeenCalledWith('year', 'month', 'day')

    describe '$scope.isSale', ->
      it 'calls ListingIdentityService.isSale', ->
        fakeListingIdentityService.isSale = jasmine.createSpy()
        scope.isSale(fakeListing)
        expect(fakeListingIdentityService.isSale).toHaveBeenCalled()

    describe '$scope.hasSaleAndRentalApplications', ->
      it 'calls ListingIdentityService.isSale', ->
        fakeListingIdentityService.isSale = jasmine.createSpy()
        scope.hasSaleAndRentalApplications([fakeApplication])
        expect(fakeListingIdentityService.isSale).toHaveBeenCalled()

      it 'returns false if there are no applications', ->
        expect(scope.hasSaleAndRentalApplications([])).toEqual(false)

      it 'returns true if there are at least two different applications', ->
        fakeListingIdentityService.isSale = jasmine.createSpy().and.returnValues(false, true)
        expect(scope.hasSaleAndRentalApplications([fakeApplication, fakeApplication])).toEqual(true)

    describe '$scope.validatePasswordConfirmationMatch', ->
      it 'returns false if password is empty', ->
        fakeAccountService.userAuth.user.password = ''
        expect(scope.validatePasswordConfirmationMatch('password')).toEqual(false)

      it 'returns false if password and confirmation does not match', ->
        fakeAccountService.userAuth.user.password = 'password'
        expect(scope.validatePasswordConfirmationMatch('pass')).toEqual(false)

      it 'returns true if password and confirmation match', ->
        fakeAccountService.userAuth.user.password = 'password'
        expect(scope.validatePasswordConfirmationMatch('password')).toEqual(true)

    describe '$scope.passwordConfirmationError', ->
      it 'calls translate with require message when confirmation is not set', ->
        scope.userAuth.user.password_confirmation = ''
        scope.passwordConfirmationError()
        expect($translate.instant).toHaveBeenCalledWith('label.field_required')
      it 'calls translate with match error when confirmation is set', ->
        scope.userAuth.user.password_confirmation = 'password'
        scope.passwordConfirmationError()
        expect($translate.instant).toHaveBeenCalledWith('error.password_confirmation')
