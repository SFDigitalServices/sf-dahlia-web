do ->
  'use strict'
  describe 'AccountController', ->
    scope = undefined
    fakeAccountService =
      createAccount: -> null

    beforeEach module('dahlia.controllers', () ->
      return
    )

    beforeEach inject(($rootScope, $controller, $q) ->
      scope = $rootScope.$new()
      scope.form = {accountForm: {}}
      spyOn(fakeAccountService, 'createAccount').and.callFake ->
        deferred = $q.defer()
        deferred.resolve('Remote call result')
        return deferred.promise


      $controller 'AccountController',
        $scope: scope
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

  return
