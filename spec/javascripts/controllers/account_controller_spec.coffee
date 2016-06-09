do ->
  'use strict'
  describe 'AccountController', ->
    scope = undefined
    fakeAccountService =
      returnToRememberedState: jasmine.createSpy()

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

    describe '$scope.continueApplication', ->
      it 'calls function on AccountService', ->
        scope.continueApplication()
        expect(fakeAccountService.returnToRememberedState).toHaveBeenCalled()
        return
      return

  return
