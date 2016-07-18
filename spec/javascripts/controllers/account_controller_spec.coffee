do ->
  'use strict'
  describe 'AccountController', ->
    scope = undefined
    fakeAccountService =
      createAccount: -> null
      signIn: -> null

    beforeEach module('dahlia.controllers', () ->
      return
    )

    beforeEach inject(($rootScope, $controller, $q) ->
      scope = $rootScope.$new()
      scope.form = {accountForm: {}}
      state = jasmine.createSpyObj('$state', ['go'])
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
