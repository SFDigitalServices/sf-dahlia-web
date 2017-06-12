do ->
  'use strict'
  describe 'ModalService', ->
    ModalService = undefined
    modalMock =
      open: ->
        {result: {then: -> { catch: -> }}}

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$modal', modalMock
      return
    )

    beforeEach inject((_ModalService_) ->
      ModalService = _ModalService_
    )

    describe 'alert', ->
      beforeEach ->
        spyOn(modalMock, 'open').and.callThrough()

      it 'creates an alert and modal instance', ->
        expect(ModalService.messages.alert).not.toBeDefined()
        expect(ModalService.modalInstance).toEqual null
        ModalService.alert('hi')
        expect(ModalService.messages.alert).toEqual 'hi'
        expect(modalMock.open).toHaveBeenCalled()

      it 'does not call $modal service when modalInstance exists', ->
        ModalService.modalInstance = {someobject: 'hello'}
        ModalService.alert('yo')
        expect(ModalService.messages.alert).toEqual 'yo'
        expect(modalMock.open).not.toHaveBeenCalled()
