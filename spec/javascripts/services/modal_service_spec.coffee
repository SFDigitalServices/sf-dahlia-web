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
        expect(ModalService.content.message).not.toBeDefined()
        expect(ModalService.modalInstance).toEqual null
        content =
          message: 'hi'
        ModalService.alert(content)
        expect(ModalService.content.message).toEqual 'hi'
        expect(modalMock.open).toHaveBeenCalled()

      it 'does not call $modal service when modalInstance exists', ->
        ModalService.modalInstance = {someobject: 'hello'}
        content =
          message: 'yo'
        ModalService.alert(content)
        expect(ModalService.content.message).toEqual 'yo'
        expect(modalMock.open).not.toHaveBeenCalled()
