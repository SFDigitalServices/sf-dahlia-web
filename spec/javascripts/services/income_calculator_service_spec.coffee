do ->
  'use strict'
  describe 'IncomeCalculatorService', ->

    IncomeCalculatorService = undefined
    $localStorage = undefined
    defaultIncomeSource =
        source: undefined
        value: undefined
        frequency: undefined
        editing: false
    fakeIncomeSource =
      source: "Wages"
      value: "8000"
      frequency: "year"
      editing: false

    beforeEach module('dahlia.services', ->
    )

    beforeEach inject((_IncomeCalculatorService_, _$localStorage_) ->
      IncomeCalculatorService = _IncomeCalculatorService_
      $localStorage = _$localStorage_
      return
    )

    describe 'Service setup', ->
      it 'initializes defaultIncomeSource', ->
        expect(IncomeCalculatorService.defaultIncomeSource).toEqual defaultIncomeSource
        return

      it 'initializes incomeSources', ->
        expect(IncomeCalculatorService.incomeSources).toEqual []
        return
      return

    describe 'Service.addIncomeSource', ->
      it 'adds income object to incomeSources array', ->
        IncomeCalculatorService.addIncomeSource(fakeIncomeSource)
        expect(IncomeCalculatorService.incomeSources).toEqual([fakeIncomeSource])
        return
      return

    describe 'Service.deleteIncome', ->
      it 'removes income object from incomeSources array', ->
        IncomeCalculatorService.addIncomeSource(fakeIncomeSource)
        IncomeCalculatorService.deleteIncome(fakeIncomeSource)
        expect(IncomeCalculatorService.incomeSources).toEqual []
        return
      return

    describe 'Service.calculateTotalYearlyIncome', ->
      it 'removes income object from incomeSources array', ->
        IncomeCalculatorService.addIncomeSource(fakeIncomeSource)
        IncomeCalculatorService.deleteIncome(fakeIncomeSource)
        expect(IncomeCalculatorService.incomeSources).toEqual []
        return
      return

    describe 'Service.calculateTotalYearlyIncome', ->
      it 'correctly adds up total yearly income from incomeSources', ->
        fakeIncomeSource2 =
          source: "Disability"
          value: "175"
          frequency: "month"
          editing: false
        expectedResult = fakeIncomeSource.value + (fakeIncomeSource2.value * 12)
        IncomeCalculatorService.addIncomeSource(fakeIncomeSource)
        IncomeCalculatorService.addIncomeSource(fakeIncomeSource2)
        expect(IncomeCalculatorService.calculateTotalYearlyIncome()).toEqual expectedResult
    return
  return
