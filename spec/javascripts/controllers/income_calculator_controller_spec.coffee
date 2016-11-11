do ->
  'use strict'
  describe 'IncomeCalculatorController', ->

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
      fakeIncomeCalculatorService.nextId = jasmine.createSpy()
      fakeIncomeCalculatorService.newIncomeSource = () ->
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

      it 'populates $scope.incomeSources with income sources from the IncomeCalc Service', ->
        expect(scope.incomeSources).toEqual fakeIncomeSources

      it 'assigns $scope.additionalIncome as false', ->
        expect(scope.additionalIncome).toEqual false

    describe '$scope.noIncomeSources', ->
      describe 'incomeSources is not empty', ->
        it 'returns false', ->
          expect(scope.noIncomeSources()).toEqual false

    describe '$scope.hasIncomeSources', ->
      describe 'incomeSources is not empty', ->
        it 'returns true', ->
          expect(scope.hasIncomeSources()).toEqual true

    describe '$scope.toggleIncomeEditForm', ->
      describe 'income.editing is false', ->
        it 'toggles income editing value', ->
          expect(scope.hasIncomeSources()).toEqual true

    describe '$scope.toggleAdditionalIncomeForm', ->
      describe '$scope.additionalIncome is false', ->
        it 'toggles additionalIncome value', ->
          scope.toggleAdditionalIncomeForm()
          expect(scope.additionalIncome).toEqual true

    describe '$scope.addAdditionalIncome', ->
      beforeEach ->
        spyOn(fakeIncomeCalculatorService, 'newIncomeSource')
        scope.income = fakeIncomeSource
        scope.addAdditionalIncome()

      it 'calls IncomeCalculatorService.function', ->
        expect(fakeIncomeCalculatorService.addIncomeSource).toHaveBeenCalled()

      it 'resets scope.income to a new income source', ->
        expect(fakeIncomeCalculatorService.newIncomeSource).toHaveBeenCalled()

    describe '$scope.totalHouseholdIncome', ->
      it 'expects IncomeCalculatorService.function to be called', ->
        scope.totalHouseholdIncome()
        expect(fakeIncomeCalculatorService.calculateTotalYearlyIncome).toHaveBeenCalled()

    describe '$scope.deleteIncome', ->
      it 'expects IncomeCalculatorService.function to be called', ->
        scope.deleteIncome(fakeIncomeSource)
        expect(fakeIncomeCalculatorService.deleteIncome).toHaveBeenCalled()

    describe '$scope.resetIncomeSource', ->
      beforeEach ->
        spyOn(fakeIncomeCalculatorService, 'newIncomeSource').and.returnValue(defaultIncomeSource)
        scope.resetIncomeSource()

      it 'called newIncomeSource function in IncomeCalculatorService', ->
        expect(fakeIncomeCalculatorService.newIncomeSource).toHaveBeenCalled()

      it 'assigns scope.income to default income values', ->
        expect(scope.income).toEqual(defaultIncomeSource)

    describe '$scope.closeAdditionalIncomeForm', ->
      it 'assigns scope.additionalIncome to false', ->
        scope.additionalIncome = true
        scope.closeAdditionalIncomeForm()
        expect(scope.additionalIncome).toEqual(false)

    describe 'scope.nextId', ->
      it 'calls nextId from IncomeCalculatorService', ->
        scope.nextId()
        expect(fakeIncomeCalculatorService.nextId).toHaveBeenCalled()
