do ->
  'use strict'
  describe 'EligibilityEstimatorController', ->

    scope = undefined
    state = undefined
    income = undefined
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
      state = jasmine.createSpyObj('$state', ['go'])
      fakeListingService.setEligibilityFilters = jasmine.createSpy()

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
          income = 1000
          fakeIncomeCalculatorService.calculateTotalYearlyIncome = () ->
            return income
          scope = $rootScope.$new()
          $controller 'EligibilityEstimatorController',
            $scope: scope
            $state: state
            IncomeCalculatorService: fakeIncomeCalculatorService
            ListingService: fakeListingService
          return
        )
        it 'assigns filters.income_total with calculated yearly income', ->
          expect(scope.filters.income_total).toEqual income
          return
        return

      describe 'resetChildrenUnder6', ->
        it 'resets filters.children_under_6 value', ->
          scope.filters.children_under_6 = '1'
          scope.resetChildrenUnder6()
          expect(scope.filters.children_under_6).toEqual '0'
          return
        return

      describe 'submitForm', ->
        describe 'valid form', ->

          beforeEach ->
            scope.eligibilityForm = { $valid: true }
            scope.submitForm()

          it 'calls function to store on filters in ListingService', ->
            expect(fakeListingService.setEligibilityFilters)
              .toHaveBeenCalledWith(scope.filters)
            return

          it 'changes state to dahlia.listings', ->
            expect(state.go).toHaveBeenCalledWith('dahlia.listings')
            return
          return

        describe 'invalid form', ->
          it 'assigned hideAlert to false', ->
            scope.hideAlert = true
            scope.eligibilityForm = { $valid: false }
            scope.submitForm()
            expect(scope.hideAlert).toEqual false
        return

      describe 'clearForm', ->
        beforeEach ->
          scope.eligibilityForm = {}
          scope.eligibilityForm.$setUntouched = jasmine.createSpy()
          scope.eligibilityForm.$setPristine = jasmine.createSpy()
          fakeIncomeCalculatorService.resetIncomeSources = jasmine.createSpy()
          scope.clearForm()

        it 'resets form', ->
          expect(scope.eligibilityForm.$setUntouched).toHaveBeenCalled()
          expect(scope.eligibilityForm.$setPristine).toHaveBeenCalled()
          expect(scope.hideAlert).toEqual false
          return

        it 'resets filters', ->
          expect(scope.filters).toEqual(eligibilityFilterDefaults)
          return

        it 'calls function to store on filters in ListingService', ->
          expect(fakeListingService.setEligibilityFilters)
            .toHaveBeenCalledWith(scope.filters)
          return

        it 'calls IncomeCalc Service to reset income sources', ->
          expect(fakeIncomeCalculatorService.resetIncomeSources).toHaveBeenCalled()
          return
        return

      describe 'hasCalculatedIncome', ->
        describe 'yearlyIncome greater than zero', ->
          beforeEach inject(($rootScope, $controller) ->
            income = 1000
            fakeIncomeCalculatorService.calculateTotalYearlyIncome = () ->
              return income
            scope = $rootScope.$new()
            $controller 'EligibilityEstimatorController',
              $scope: scope
              $state: state
              IncomeCalculatorService: fakeIncomeCalculatorService
              ListingService: fakeListingService
            return
          )
          it 'returns true', ->
            expect(scope.hasCalculatedIncome()).toEqual(true)
          return
        describe 'yearlyIncome is zero', ->
          it 'returns false', ->
            expect(scope.hasCalculatedIncome()).toEqual(false)
          return

      describe 'goToIncomeCalculator', ->
        it 'calls function to store current filters into ListingService',->
          scope.goToIncomeCalculator()
          expect(fakeListingService.setEligibilityFilters).toHaveBeenCalledWith(scope.filters)
          return
        return
  return
