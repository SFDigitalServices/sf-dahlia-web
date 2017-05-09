do ->
  'use strict'
  describe 'Short Form Language Switcher', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $state =
      href: jasmine.createSpy()
      current:
        name: 'name'

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_, $q) ->
      $componentController = _$componentController_
      deferred = $q.defer()
      locals =
        $state: $state
    )

    beforeEach ->
      ctrl = $componentController 'shortFormLanguageSwitcher', locals

    describe 'switchToLanguage', ->
      it 'calls state.href with proper arguments', ->
        ctrl.switchToLanguage('Spanish')
        expect($state.href).toHaveBeenCalledWith('name', {lang: 'Spanish'})

