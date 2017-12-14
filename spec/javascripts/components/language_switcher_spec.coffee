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

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_, $q) ->
      $componentController = _$componentController_
      deferred = $q.defer()
      locals =
        $state: $fakeState
    )

    beforeEach ->
      ctrl = $componentController 'languageSwitcher', locals

    describe 'switchToLanguage', ->
      it 'calls state.href with proper arguments', ->
        spyOn($fakeState, 'href').and.callThrough()
        ctrl.switchToLanguage('es')
        expect($fakeState.href).toHaveBeenCalledWith('name', {lang: 'es'})

    describe 'isSelectedLanguage', ->
      beforeEach ->
        $fakeState.params.lang = 'es'
      it 'compares against $state.params.lang', ->
        expect(ctrl.isSelectedLanguage('es')).toEqual true
        expect(ctrl.isSelectedLanguage('zh')).toEqual false
