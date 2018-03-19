do ->
  'use strict'
  describe 'ModalInstanceController', ->

    scope = undefined
    state = undefined
    fakeModalService =
      callbacks: {
        onConfirm: jasmine.createSpy()
      }
      openModal: jasmine.createSpy()
      closeModal: jasmine.createSpy()

    beforeEach module('dahlia.controllers', ($provide) ->
      $provide.value 'ModalService', fakeModalService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()

      $controller 'ModalInstanceController',
        $scope: scope
        $state: state
    )

    describe '$scope.closeModal', ->
      it 'calls ModalService.closeModal', ->
        scope.closeModal()
        expect(fakeModalService.closeModal).toHaveBeenCalled()

    describe '$scope.confirm', ->
      beforeEach ->
        scope.closeModal = jasmine.createSpy()
        scope.confirm()

      it "calls the ModalService's callbacks' onConfirm function", ->
        expect(fakeModalService.callbacks.onConfirm).toHaveBeenCalled()

      it 'calls scope.closeModal', ->
        expect(scope.closeModal).toHaveBeenCalled()
