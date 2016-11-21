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
      fakeListingService.resetEligibilityFilters = jasmine.createSpy()

      $controller 'EligibilityEstimatorController',
        $scope: scope
        $state: state
        ListingService: fakeListingService
      return
    )

    describe 'scope defaults are set', ->
      it 'populates $scope.filters with filter values from ListingService', ->
        expect(scope.filters).toEqual eligibilityFilterDefaults

      it 'populates $scope.hideAlert as false', ->
        expect(scope.hideAlert).toEqual false

      describe 'IncomeCalculatorService.calculateTotalYearlyIncome is 0', ->
        it 'populates $scope.filter_defaults with default filters', ->
          expect(scope.filter_defaults).toEqual eligibilityFilterDefaults

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
        )
        it 'assigns filters.income_total with calculated yearly income', ->
          expect(scope.filters.income_total).toEqual income

      describe 'resetChildrenUnder6', ->
        it 'resets filters.children_under_6 value', ->
          scope.filters.children_under_6 = '1'
          scope.resetChildrenUnder6()
          expect(scope.filters.children_under_6).toEqual ''

      describe 'submitForm', ->
        describe 'valid form', ->

          beforeEach ->
            scope.eligibilityForm = { $valid: true }
            scope.submitForm()

          it 'calls function to store on filters in ListingService', ->
            expect(fakeListingService.setEligibilityFilters)
              .toHaveBeenCalledWith(scope.filters)

          it 'changes state to dahlia.listings', ->
            expect(state.go).toHaveBeenCalledWith('dahlia.listings')

        describe 'invalid form', ->
          it 'assigned hideAlert to false', ->
            scope.hideAlert = true
            scope.eligibilityForm = { $valid: false }
            scope.submitForm()
            expect(scope.hideAlert).toEqual false

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

        it 'resets filters', ->
          expect(scope.filters).toEqual(eligibilityFilterDefaults)

        it 'calls function to reset filters in ListingService', ->
          expect(fakeListingService.resetEligibilityFilters)
            .toHaveBeenCalled()

        it 'calls IncomeCalc Service to reset income sources', ->
          expect(fakeIncomeCalculatorService.resetIncomeSources).toHaveBeenCalled()

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
          )
          it 'returns true', ->
            expect(scope.hasCalculatedIncome()).toEqual(true)

        describe 'yearlyIncome is zero', ->
          it 'returns false', ->
            expect(scope.hasCalculatedIncome()).toEqual(false)

      describe 'goToIncomeCalculator', ->
        it 'calls function to store current filters into ListingService',->
          scope.goToIncomeCalculator()
          expect(fakeListingService.setEligibilityFilters).toHaveBeenCalledWith(scope.filters)
