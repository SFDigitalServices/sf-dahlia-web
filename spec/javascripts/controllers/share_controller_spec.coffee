do ->
  'use strict'
  describe 'ShareController', ->

    scope = undefined
    fakeState = {}
    fakeState.href = (state, params) -> '/'
    fakeState.params = {id: undefined}
    fakeSharedService = undefined

    beforeEach module('dahlia.controllers', ($provide) ->
      $provide.value 'SharedService', fakeSharedService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      $controller 'ShareController',
        $scope: scope
        $state: fakeState
        clipboardLink: undefined
      return
    )

    describe '$scope.textToCopy', ->
      describe 'expects $scope.clipboardLink to be called and return link', ->
        it 'calls clipboardLink and returns link', ->
          expect(scope.textToCopy.indexOf('http')).toEqual 0

    describe '$scope.clipboardLink', ->
      describe 'calles clipboardLink', ->
        it 'returns a link', ->
          expect(scope.clipboardLink().indexOf('http')).toEqual 0

    describe '$scope.clipboardSuccess', ->
      describe 'toggles clipboardSuccess', ->
        it 'returns true', ->
          expect(scope.clipboardSuccess()).toEqual true

    describe '$scope.closeShareSuccess', ->
      describe 'toggles closeShareSuccess', ->
        it 'returns false', ->
          expect(scope.closeShareSuccess()).toEqual false
