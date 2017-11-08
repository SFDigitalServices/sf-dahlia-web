do ->
  'use strict'
  describe 'ModalInstanceController', ->

    scope = undefined
    state = undefined
    fakeModalInstance = undefined
    fakeAccountService =
      modalInstance: {}

    beforeEach module('dahlia.controllers', ($provide) ->
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()

      fakeModalInstance =
        close: jasmine.createSpy('fakeModalInstance.close'),
        dismiss: jasmine.createSpy('fakeModalInstance.dismiss'),
        result:
          then: jasmine.createSpy('fakeModalInstance.result.then')

      $controller 'ModalInstanceController',
        $scope: scope
        $state: state
        $modalInstance: fakeModalInstance
        AccountService: fakeAccountService
    )

    describe '$scope.closeModal', ->
      describe 'expects ModalInstance.close to be called', ->
        it 'calls the modalInstance to close', ->
          scope.closeModal()
          expect(fakeModalInstance.close).toHaveBeenCalled()
