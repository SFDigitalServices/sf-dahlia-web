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
      trackFormAbandon: jasmine.createSpy()
    fakeAccountService =
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
    fakeShortFormApplicationService =
      importUserData: -> null
      submitApplication: -> null
      signInSubmitApplication: -> null

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
    )

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

      it 'calls function on AccountService', ->
        scope.signIn()
        expect(fakeAccountService.signIn).toHaveBeenCalled()

      it 'disables the submit button when signIn is called', ->
        scope.signIn()
        expect(scope.submitDisabled).toEqual true

      describe 'user in short form session', ->
        beforeEach ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(true)
          state.current.name = 'dahlia.short-form-application.sign-in'
          deferred.resolve(true)

        it 'calls ShortFormApplicationService.signInSubmitApplication', ->
          fakeShortFormApplicationService.application = { status: 'draft' }
          scope.signIn()
          scope.$apply()
          expect(fakeShortFormApplicationService.signInSubmitApplication).toHaveBeenCalled()

      describe 'user not in short form session', ->
        beforeEach ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(true)
          state.current.name = 'dahlia.sign-in'
          deferred.resolve(true)

        it 'sends user to AccountService.goToLoginRedirect if available', ->
          state.params.fromShortFormIntro = null
          fakeAccountService.loginRedirect = 'dahlia.listings'
          scope.signIn()
          scope.$apply()
          expect(fakeAccountService.goToLoginRedirect).toHaveBeenCalled()

        it 'sends user to dahlia.my-account by default', ->
          state.params.fromShortFormIntro = null
          fakeAccountService.loginRedirect = null
          scope.signIn()
          scope.$apply()
          expect(state.go).toHaveBeenCalledWith('dahlia.my-account')

      describe 'user signing in from short from intro page', ->
        beforeEach ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(true)
          state.current.name = 'dahlia.sign-in'
          state.params.fromShortFormIntro = true
          fakeShortFormApplicationService.listing =
            Id: "123"
          deferred.resolve(true)

        it 'sends user back to short form intro page', ->
          scope.signIn()
          scope.$apply()
          expect(state.go).toHaveBeenCalledWith('dahlia.short-form-welcome.intro', {id: '123'})

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
