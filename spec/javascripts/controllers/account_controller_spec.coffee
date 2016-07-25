do ->
  'use strict'
  describe 'AccountController', ->
    scope = undefined
    state = {current: {name: undefined}}
    $translate = {}
    fakeAccountService =
      createAccount: -> null
      signIn: -> null
    fakeShortFormApplicationService =
      submitApplication: (options={}) -> null

    beforeEach module('dahlia.controllers', ($provide) ->
      $provide.value '$translate', $translate
      return
    )

    beforeEach inject(($rootScope, $controller, $q) ->
      scope = $rootScope.$new()
      scope.form = {accountForm: {}}
      state.go = jasmine.createSpy()
      spyOn(fakeAccountService, 'createAccount').and.callFake ->
        deferred = $q.defer()
        deferred.resolve('Remote call result')
        return deferred.promise
      spyOn(fakeAccountService, 'signIn').and.callFake ->
        deferred = $q.defer()
        deferred.resolve('Remote call result')
        return deferred.promise


      $controller 'AccountController',
        $scope: scope
        $state: state
        AccountService: fakeAccountService
        ShortFormApplicationService: fakeShortFormApplicationService
      return
    )

    describe '$scope.createAccount', ->
      it 'calls function on AccountService', ->
        scope.form.accountForm = {$valid: true}
        scope.createAccount()
        expect(fakeAccountService.createAccount).toHaveBeenCalled()
        return
      return

    describe '$scope.signIn', ->
      it 'calls function on AccountService', ->
        scope.form.accountForm = {$valid: true}
        scope.signIn()
        expect(fakeAccountService.signIn).toHaveBeenCalled()
        return
      return

  return
