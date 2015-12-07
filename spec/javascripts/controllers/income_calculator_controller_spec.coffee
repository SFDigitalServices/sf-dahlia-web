do ->
  'use strict'
  describe 'IncomeCalculatorController', ->

    jasmine.getJSONFixtures().fixturesPath = '/public/json'
    scope = undefined
    state = undefined
    fakeIncomeCalculatorService = undefined

    defaultIncomeSource =
      id: undefined
      source: undefined
      value: undefined
      frequency: undefined
      editing: false

    fakeIncomeSource =
      id: 1
      source: "Wages"
      value: "8000"
      frequency: "year"
      editing: false
    fakeIncomeSources = [fakeIncomeSource]


    beforeEach module('dahlia.controllers', ($provide) ->
      fakeIncomeCalculatorService =
        defaultIncomeSource: defaultIncomeSource
        incomeSources: fakeIncomeSources
      fakeIncomeCalculatorService.addIncomeSource = jasmine.createSpy()
      fakeIncomeCalculatorService.calculateTotalYearlyIncome = jasmine.createSpy()
      fakeIncomeCalculatorService.deleteIncome = jasmine.createSpy()
      fakeIncomeCalculatorService.newIncomeSource = jasmine.createSpy()
      $provide.value 'IncomeCalculatorService', fakeIncomeCalculatorService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      $controller 'IncomeCalculatorController',
        $scope: scope
        $state: state
      return
    )

    describe 'scope defaults are set', ->
      it 'populates $scope.income with default income source', ->
        expect(scope.income).toEqual defaultIncomeSource
        return

      it 'populates $scope.incomeSources with income sources from the IncomeCalc Service', ->
        expect(scope.incomeSources).toEqual fakeIncomeSources
        return

      it 'assigns $scope.additionalIncome as false', ->
        expect(scope.additionalIncome).toEqual false
        return
      return

    describe '$scope.noIncomeSources', ->
      describe 'incomeSources is not empty', ->
        it 'returns false', ->
          expect(scope.noIncomeSources()).toEqual false
          return
        return
      return

    describe '$scope.hasIncomeSources', ->
      describe 'incomeSources is not empty', ->
        it 'returns true', ->
          expect(scope.hasIncomeSources()).toEqual true
          return
        return
      return

    describe '$scope.toggleIncomeEditForm', ->
      describe 'income.editing is false', ->
        it 'toggles income editing value', ->
          expect(scope.hasIncomeSources()).toEqual true
          return
        return
      return

    describe '$scope.toggleAdditionalIncomeForm', ->
      describe '$scope.additionalIncome is false', ->
        it 'toggles additionalIncome value', ->
          scope.toggleAdditionalIncomeForm()
          expect(scope.additionalIncome).toEqual true
          return
        return
      return

    describe '$scope.addAdditionalIncome', ->
      beforeEach ->
        scope.income = fakeIncomeSource
        scope.addAdditionalIncome()

      it 'calls IncomeCalculatorService.function', ->
        expect(fakeIncomeCalculatorService.addIncomeSource).toHaveBeenCalled()
        return

      it 'resets scope.income to a new income source', ->
        expect(fakeIncomeCalculatorService.newIncomeSource).toHaveBeenCalled()
        return
      return

    describe '$scope.totalHouseholdIncome', ->
      it 'expects IncomeCalculatorService.function to be called', ->
        scope.totalHouseholdIncome()
        expect(fakeIncomeCalculatorService.calculateTotalYearlyIncome).toHaveBeenCalled()
        return
      return

    describe '$scope.deleteIncome', ->
      it 'expects IncomeCalculatorService.function to be called', ->
        scope.deleteIncome(fakeIncomeSource)
        expect(fakeIncomeCalculatorService.deleteIncome).toHaveBeenCalled()
        return
      return
    return
  return
