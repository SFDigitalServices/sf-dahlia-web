do ->
  'use strict'
  describe 'AccountController', ->
    scope = undefined
    state = {current: {name: undefined}}
    deferred = undefined
    $translate = {}
    $analytics =
      eventTrack: ->
    fakeAccountService =
      createAccount: -> null
      signIn: -> null
      loggedIn: -> null
      updatePassword: -> null
      updateAccount: -> null
      resendConfirmationEmail: -> null
      requestPasswordReset: jasmine.createSpy()
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
      getMyAccountApplication: -> null

    beforeEach module('dahlia.controllers', ($provide) ->
      $provide.value '$translate', $translate
      return
    )

    beforeEach inject(($rootScope, $controller, $q) ->
      scope = $rootScope.$new()
      scope.form =
        signIn: {}
        createAccount: {}
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
      spyOn(fakeShortFormApplicationService, 'importUserData').and.returnValue(false)
      spyOn(fakeShortFormApplicationService, 'submitApplication').and.returnValue(deferred.promise)
      spyOn(fakeShortFormApplicationService, 'getMyAccountApplication').and.callFake -> fakeHttp

      $controller 'AccountController',
        $scope: scope
        $state: state
        $analytics: $analytics
        AccountService: fakeAccountService
        ShortFormApplicationService: fakeShortFormApplicationService
      return
    )

    describe '$scope.createAccount', ->
      beforeEach ->
        scope.form.createAccount =
          $valid: true
          $setUntouched: () ->
            return
          $setPristine: () ->
            return

      it 'calls function on AccountService', ->
        scope.createAccount()
        expect(fakeAccountService.createAccount).toHaveBeenCalled()
        return

      describe 'user in short form session', ->
        beforeEach ->
          fakeShortFormApplicationService.session_uid = 'someuid'
          state.current.name = 'dahlia.short-form-application.create-account'
          deferred.resolve(true)

        it 'calls createAccount function on account service with shortFormSession data', ->
          expectedArgument = {uid: 'someuid'}
          scope.createAccount()
          expect(fakeAccountService.createAccount).toHaveBeenCalledWith(expectedArgument)
          return

        it 'submits application as draft ', ->
          scope.createAccount()
          scope.$apply()
          expectedArgument = {attachToAccount: true}
          expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalledWith(expectedArgument)
          return

        it 'routes user to sign-in', ->
          scope.createAccount()
          scope.$apply()
          expect(state.go).toHaveBeenCalledWith('dahlia.sign-in', {skipConfirm: true, newAccount: true})
          return
        return
      return

    describe '$scope.signIn', ->
      beforeEach ->
        scope.form.signIn =
          $valid: true
          $setUntouched: () ->
            return
          $setPristine: () ->
            return

      it 'calls function on AccountService', ->
        scope.signIn()
        expect(fakeAccountService.signIn).toHaveBeenCalled()
        return

      it 'disables the submit button when signIn is called', ->
        scope.signIn()
        expect(scope.submitDisabled).toEqual true
        return

      describe 'user in short form session', ->
        beforeEach ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(true)
          state.current.name = 'dahlia.short-form-application.sign-in'
          deferred.resolve(true)

        it 'submits draft application', ->
          fakeShortFormApplicationService.application = { status: 'draft' }
          scope.signIn()
          scope.$apply()
          expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalled()
          return

        it 'routes user to my applications', ->
          fakeShortFormApplicationService.application = { status: 'draft' }
          scope.signIn()
          scope.$apply()
          expect(state.go).toHaveBeenCalledWith('dahlia.my-applications', {skipConfirm: true, infoChanged: false})
          return
        return

      describe 'user not in short form session', ->
        beforeEach ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(true)
          state.current.name = 'dahlia.sign-in'
          deferred.resolve(true)

        it 'sends user to AccountService.goToLoginRedirect if available', ->
          fakeAccountService.loginRedirect = 'dahlia.listings'
          scope.signIn()
          scope.$apply()
          expect(fakeAccountService.goToLoginRedirect).toHaveBeenCalled()
          return

        it 'sends user to dahlia.my-account by default', ->
          fakeAccountService.loginRedirect = null
          scope.signIn()
          scope.$apply()
          expect(state.go).toHaveBeenCalledWith('dahlia.my-account')
          return
        return
      return

    describe '$scope._signInAndSkipSubmit', ->
      it 'checks if you\'ve already submitted', ->
        fakePrevApplication = { status: 'submitted', id: '123' }
        params = {skipConfirm: true, alreadySubmittedId: fakePrevApplication.id, doubleSubmit: false}
        scope._signInAndSkipSubmit(fakePrevApplication)
        expect(state.go).toHaveBeenCalledWith('dahlia.my-applications', params)
        return
      it 'sends you to choose draft', ->
        fakePrevApplication = { status: 'draft' }
        scope._signInAndSkipSubmit(fakePrevApplication)
        expect(state.go).toHaveBeenCalledWith('dahlia.short-form-application.choose-draft')
        return
      return


    describe '$scope.requestPasswordReset', ->
      it 'calls on AccountService.requestPasswordReset', ->
        scope.requestPasswordReset()
        expect(fakeAccountService.requestPasswordReset).toHaveBeenCalled()
        return
      return

    describe '$scope.updatePassword', ->
      it 'calls AccountService.updatePassword', ->
        scope.form.accountPassword = {$valid: true}
        scope.updatePassword('reset')
        expect(fakeAccountService.updatePassword).toHaveBeenCalled()
        return
      return

    describe '$scope.updateEmail', ->
      it 'calls AccountService.updateAccount', ->
        scope.form.accountEmail = {$valid: true}
        scope.updateEmail()
        expect(fakeAccountService.updateAccount).toHaveBeenCalledWith('email')
        return
      return

    describe '$scope.updateNameDOB', ->
      it 'calls AccountService.updateAccount', ->
        scope.form.accountNameDOB = {$valid: true}
        scope.updateNameDOB()
        expect(fakeAccountService.updateAccount).toHaveBeenCalledWith('nameDOB')
        return
      return

    describe '$scope.resendConfirmationEmail', ->
      it 'calls AccountService.resendConfirmationEmail', ->
        scope.resendConfirmationEmail()
        expect(fakeAccountService.resendConfirmationEmail).toHaveBeenCalled()
        return
      return

    describe '$scope._createAccountSubmitApplication', ->
      it 'calls ShortFormApplicationService.importUserData', ->
        scope._createAccountSubmitApplication()
        expect(fakeShortFormApplicationService.importUserData).toHaveBeenCalled()
        return
      it 'calls ShortFormApplicationService.importUserData', ->
        scope._createAccountSubmitApplication()
        expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalled()
        return
      return
  return
