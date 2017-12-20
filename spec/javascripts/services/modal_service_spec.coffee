do ->
  'use strict'
  describe 'ModalService', ->
    ModalService = undefined
    modalMock =
      open: ->
        {result: {then: -> { catch: -> }}}
    $window = undefined

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$modal', modalMock
      return
    )

    beforeEach inject((_$window_, _ModalService_) ->
      $window = _$window_
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

      it 'adds onConfirm callback if passed in', ->
        fakeCallback = -> 'hi'
        ModalService.alert('yo', {onConfirm: fakeCallback})
        expect(ModalService.callbacks.onConfirm).toEqual fakeCallback

      it 'uses native browser alert if specified', ->
        spyOn($window, 'alert')
        ModalService.alert('yo', {nativeAlert: true})
        expect($window.alert).toHaveBeenCalledWith('yo')
