do ->
  'use strict'
  describe 'NavController', ->
    fakeDocument = {}
    scope = undefined
    state = undefined
    fakeTimeout = {}

    fakeTranslate =
      instant: ->
    fakeAccountService =
      signOut: jasmine.createSpy()
    fakeModalService =
      alert: ->
    fakeShortFormApplicationService =
      isShortFormPage: ->

    beforeEach module('dahlia.controllers', ($provide) ->
      $provide.value 'AccountService', fakeAccountService
      $provide.value 'ModalService', fakeModalService
      $provide.value 'ShortFormApplicationService', fakeShortFormApplicationService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      state = jasmine.createSpyObj('$state', ['go'])
      scope = $rootScope.$new()
      $controller 'NavController',
        $document: fakeDocument
        $scope: scope
        $state: state
        $timeout: fakeTimeout
        $translate: fakeTranslate
      return
    )

    describe '$scope.signOut', ->
      describe 'signing out from shortform page', ->
        it 'opens modal alert box', ->
          spyOn(fakeShortFormApplicationService, 'isShortFormPage').and.returnValue(true)
          spyOn(fakeModalService, 'alert').and.returnValue(true)
          scope.signOut()
          expect(fakeModalService.alert).toHaveBeenCalled()

      describe 'signing out of no shortform page', ->
        beforeEach ->
          spyOn(fakeShortFormApplicationService, 'isShortFormPage').and.returnValue(false)
          scope.signOut()

        it 'calls signOut from AccountService', ->
          expect(fakeAccountService.signOut).toHaveBeenCalled()
        it 'direct you to sign in page', ->
          expect(state.go).toHaveBeenCalledWith('dahlia.sign-in', {signedOut: true})

