do ->
  'use strict'
  describe 'ShareController', ->

    scope = undefined
    state = undefined
    fakeSharedService = undefined
    fakeHref = undefined

    beforeEach module('dahlia.controllers', ($provide) ->
      $provide.value 'SharedService', fakeSharedService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      $controller 'ShareController',
        $scope: scope
        $state: state
        href = fakeHref
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
