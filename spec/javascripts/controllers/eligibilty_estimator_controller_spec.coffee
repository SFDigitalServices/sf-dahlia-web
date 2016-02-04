do ->
  'use strict'
  describe 'EligibilityEstimatorController', ->

    scope = undefined
    state = undefined
    eligibilityFilterDefaults =
      'household_size': ''
      'income_timeframe': ''
      'income_total': ''
      'include_children_under_6': false
      'children_under_6': ''

    fakeListingService = {}
    fakeListingService =
      eligibility_filter_defaults: eligibilityFilterDefaults
      eligibility_filters: eligibilityFilterDefaults

    fakeIncomeCalculatorService = {}


    beforeEach module('dahlia.controllers', ($provide) ->
      fakeIncomeCalculatorService.calculateTotalYearlyIncome = () ->
        return 0
      $provide.value 'IncomeCalculatorService', fakeIncomeCalculatorService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      $controller 'EligibilityEstimatorController',
        $scope: scope
        $state: state
        ListingService: fakeListingService
      return
    )

    describe 'scope defaults are set', ->
      it 'populates $scope.filters with filter values from ListingService', ->
        expect(scope.filters).toEqual eligibilityFilterDefaults
        return

      it 'populates $scope.hideAlert as false', ->
        expect(scope.hideAlert).toEqual false
        return

      describe 'IncomeCalculatorService.calculateTotalYearlyIncome is 0', ->
        it 'populates $scope.filter_defaults with default filters', ->
          expect(scope.filter_defaults).toEqual eligibilityFilterDefaults
          return
        return

      describe 'IncomeCalculatorService.calculateTotalYearlyIncome is > 0', ->
        beforeEach inject(($rootScope, $controller) ->
          fakeIncomeCalculatorService.calculateTotalYearlyIncome = () ->
            return 1
          scope = $rootScope.$new()
          $controller 'EligibilityEstimatorController',
            $scope: scope
            $state: state
            IncomeCalculatorService: fakeIncomeCalculatorService
            ListingService: fakeListingService
          return
        )
        it 'assigns filters.income_total with calculated yearly income', ->
          expect(scope.filters.income_total).toEqual 1
          return
        return

      describe 'resetChildrenUnder6', ->
        it 'resets filters.children_under_6 value', ->
          scope.filters.children_under_6 = '1'
          scope.resetChildrenUnder6()
          expect(scope.filters.children_under_6).toEqual '0'
          return
        return
  return
