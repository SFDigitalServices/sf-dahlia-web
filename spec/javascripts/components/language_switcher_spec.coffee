do ->
  'use strict'
  describe 'Language Switcher', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $fakeState =
      href: ->
      params: {}
      current:
        name: 'name'
    fakeSharedService =
      getLanguageName: ->
      isWelcomePage: ->

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_, $q) ->
      $componentController = _$componentController_
      deferred = $q.defer()
      locals =
        $state: $fakeState
        SharedService: fakeSharedService
    )

    beforeEach ->
      ctrl = $componentController 'languageSwitcher', locals

    describe 'switchToLanguage', ->
      it 'calls state.href with proper arguments', ->
        spyOn($fakeState, 'href').and.callThrough()
        ctrl.switchToLanguage('es')
        expect($fakeState.href).toHaveBeenCalledWith('name', {lang: 'es'})

      it 'calls state.href with a language-appropriate state name for welcome pages', ->
        spyOn($fakeState, 'href').and.callThrough()
        spyOn(fakeSharedService, 'isWelcomePage').and.returnValue(true)
        spyOn(fakeSharedService, 'getLanguageName').and.returnValue('Spanish')
        $fakeState.current.name = 'dahlia.welcome-chinese'
        ctrl.switchToLanguage('es')
        expect($fakeState.href).toHaveBeenCalledWith('dahlia.welcome-spanish', {lang: 'es'})

    describe 'isSelectedLanguage', ->
      beforeEach ->
        $fakeState.params.lang = 'es'
      it 'compares against $state.params.lang', ->
        expect(ctrl.isSelectedLanguage('es')).toEqual true
        expect(ctrl.isSelectedLanguage('zh')).toEqual false
