do ->
  'use strict'
  describe 'ShareController', ->

    scope = undefined
    state = undefined
    fakeSharedService = undefined

    beforeEach module('dahlia.controllers', ($provide) ->
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      $controller 'ShareController',
        $scope: scope
        $state: state
        SharedService: fakeSharedService
      return
    )

    describe 'clipboardSuccess', ->
      describe 'toggles clipboardSuccess', ->
        it 'returns true', ->
          expect(scope.clipboardSuccess()).toEqual true
          return
        return
      return

    return
  return
