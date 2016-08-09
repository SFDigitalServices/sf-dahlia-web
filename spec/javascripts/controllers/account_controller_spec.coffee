do ->
  'use strict'
  describe 'AccountController', ->
    scope = undefined
    state = {current: {name: undefined}}
    deferred = undefined
    $translate = {}
    fakeAccountService =
      createAccount: -> null
      signIn: -> null
      loggedIn: -> null
      requestPasswordReset: jasmine.createSpy()
      updatePassword: jasmine.createSpy()
      userDataForContact: ->
        firstName: 'X'
        lastName: 'Y'
        email: 'x@y.com'
    fakeShortFormApplicationService =
      submitApplication: () -> null
      importUserData: () -> null

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
      spyOn(fakeAccountService, 'createAccount').and.returnValue(deferred.promise)
      spyOn(fakeAccountService, 'signIn').and.returnValue(deferred.promise)
      spyOn(fakeShortFormApplicationService, 'submitApplication').and.returnValue(deferred.promise)

      $controller 'AccountController',
        $scope: scope
        $state: state
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
          expectedArgument = {draft: true, attachToAccount: true}
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

      describe 'user in short form session', ->
        beforeEach ->
          spyOn(fakeAccountService, 'loggedIn').and.returnValue(true)
          state.current.name = 'dahlia.short-form-application.sign-in'
          deferred.resolve(true)

        it 'submits draft application', ->
          scope.signIn()
          scope.$apply()
          expectedArgument = {draft: true}
          expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalledWith(expectedArgument)
          return

        it 'routes user to my account', ->
          scope.signIn()
          scope.$apply()
          expect(state.go).toHaveBeenCalledWith('dahlia.my-account', {skipConfirm: true})
          return
        return
      return

    describe '$scope.requestPasswordReset', ->
      it 'calls on AccountService.function', ->
        scope.requestPasswordReset()
        expect(fakeAccountService.requestPasswordReset).toHaveBeenCalled()
        return
      return

    describe '$scope.updatePassword', ->
      it 'calls on AccountService.function', ->
        scope.updatePassword()
        expect(fakeAccountService.updatePassword).toHaveBeenCalled()
        return
      return
  return
