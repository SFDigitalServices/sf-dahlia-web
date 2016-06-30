do ->
  'use strict'
  describe 'AccountController', ->
    scope = undefined
    fakeAccountService =
      createAccount: jasmine.createSpy()

    beforeEach module('dahlia.controllers', () ->
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()

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
