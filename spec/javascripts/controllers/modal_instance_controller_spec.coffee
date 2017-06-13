do ->
  'use strict'
  describe 'ModalInstanceController', ->

    scope = undefined
    state = undefined
    fakeModalInstance = undefined
    fakeModalService =
      callbacks: {}

    beforeEach module('dahlia.controllers', ($provide) ->
      $provide.value 'ModalService', fakeModalService
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
    )

    describe '$scope.closeModal', ->
      describe 'expects ModalInstance.close to be called', ->
        it 'calls the modalInstance to close', ->
          scope.closeModal()
          expect(fakeModalInstance.close).toHaveBeenCalled()
