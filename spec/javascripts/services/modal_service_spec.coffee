do ->
  'use strict'
  describe 'ModalService', ->
    ModalService = undefined
    modalInstance =
      result: {then: -> { catch: -> }}
      close: jasmine.createSpy()
    modalMock =
      open: ->
        modalInstance
    $window = undefined
    alertTemplateUrl = 'shared/templates/alert_modal.html'

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$modal', modalMock
      return
    )

    beforeEach inject((_$window_, _ModalService_) ->
      $window = _$window_
      ModalService = _ModalService_
    )

    describe 'openModal', ->
      beforeEach ->
        spyOn(modalMock, 'open').and.callThrough()

      it 'creates a modal instance using a given template', ->
        defaultTemplateController = 'ModalInstanceController'
        defaultWindowClass = 'modal-large'
        expectedParams =
          templateUrl: alertTemplateUrl
          controller: defaultTemplateController
          windowClass: defaultWindowClass

        ModalService.openModal(alertTemplateUrl)

        expect(modalMock.open).toHaveBeenCalledWith(expectedParams)

    describe 'alert', ->
      beforeEach ->
        spyOn(ModalService, 'openModal').and.callThrough()

      it 'opens a modal with the alert template and given message', ->
        expect(ModalService.content.message).not.toBeDefined()
        expect(ModalService.modalInstance).toEqual null
        content =
          message: 'hi'
        ModalService.alert(content)
        expect(ModalService.content.message).toEqual 'hi'
        expect(ModalService.openModal).toHaveBeenCalledWith(alertTemplateUrl)

      it 'does not open a new modal when modalInstance exists', ->
        ModalService.modalInstance = modalInstance
        content =
          message: 'yo'
        ModalService.alert(content)
        expect(ModalService.content.message).toEqual 'yo'
        expect(ModalService.openModal).not.toHaveBeenCalled()

      it 'adds onConfirm callback if passed in', ->
        fakeCallback = -> 'hi'
        ModalService.alert('yo', {onConfirm: fakeCallback})
        expect(ModalService.callbacks.onConfirm).toEqual fakeCallback

      it 'uses native browser alert if specified', ->
        spyOn($window, 'alert')
        content =
          message: 'yo'
        ModalService.alert(content, {nativeAlert: true})
        expect($window.alert).toHaveBeenCalledWith('yo')

    describe 'closeModal', ->
      beforeEach ->
        ModalService.clearModal = jasmine.createSpy()

      it 'closes the open modal instance', ->
        ModalService.modalInstance = modalInstance
        ModalService.closeModal()
        expect(ModalService.modalInstance.close).toHaveBeenCalled()

      it 'calls ModalService.clearModal', ->
        ModalService.closeModal()
        expect(ModalService.clearModal).toHaveBeenCalled()

    describe 'clearModal', ->
      it 'sets the modal instance to null', ->
        ModalService.modalInstance = modalInstance
        ModalService.clearModal()
        expect(ModalService.modalInstance).toEqual(null)
