do ->
  'use strict'
  describe 'Language Switcher', ->
    $componentController = undefined
    locals = undefined
    scope = undefined
    $fakeState = {
      href: ->
      params: {}
      current: {
        name: 'name'
      }
    }
    fakeSharedService = {
      getLanguageName: ->
      isWelcomePage: ->
    }

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_, $q, _$rootScope_) ->
      $componentController = _$componentController_
      deferred = $q.defer()
      scope = _$rootScope_.$new()
      locals = {
        $state: $fakeState
        SharedService: fakeSharedService
        $scope: scope
      }
    )

    beforeEach ->
      $componentController 'languageSwitcher', locals

    describe 'stateForLanguage', ->
      it 'returns the current page when on non-welcome pages', ->
        spyOn(fakeSharedService, 'isWelcomePage').and.returnValue(false)
        toState = scope.stateForLanguage('es')
        expect(toState).toBe($fakeState.current.name)

      it 'returns the language welcome page when on welcome pages', ->
        spyOn(fakeSharedService, 'isWelcomePage').and.returnValue(true)
        spyOn(fakeSharedService, 'getLanguageName').and.returnValue('Spanish')
        $fakeState.current.name = 'dahlia.welcome-chinese'
        toState = scope.stateForLanguage('es')
        expect(toState).toBe('dahlia.welcome-spanish')

      it 'returns the home page for english', ->
        spyOn(fakeSharedService, 'isWelcomePage').and.returnValue(true)
        $fakeState.current.name = 'dahlia.welcome-chinese'
        toState = scope.stateForLanguage('en')
        expect(toState).toBe('dahlia.welcome')

    describe 'isSelectedLanguage', ->
      beforeEach ->
        $fakeState.params.lang = 'es'

      it 'compares a language to the current language state/url', ->
        expect(scope.isSelectedLanguage('es')).toEqual true
        expect(scope.isSelectedLanguage('zh')).toEqual false
