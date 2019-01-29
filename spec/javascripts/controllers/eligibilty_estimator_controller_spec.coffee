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

    fakeListingDataService = {}
    fakeListingEligibilityService = {
      eligibility_filter_defaults: eligibilityFilterDefaults
      eligibility_filters: eligibilityFilterDefaults
    }

    fakeIncomeCalculatorService = {}

    beforeEach module('dahlia.controllers', ($provide) ->
      fakeIncomeCalculatorService.calculateTotalYearlyIncome = () ->
        return 0
      $provide.value 'IncomeCalculatorService', fakeIncomeCalculatorService
      $provide.value 'ListingEligibilityService', fakeListingEligibilityService

      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      state = jasmine.createSpyObj('$state', ['go'])
      fakeListingEligibilityService.setEligibilityFilters = jasmine.createSpy()
      fakeListingEligibilityService.resetEligibilityFilters = jasmine.createSpy()

      $controller 'EligibilityEstimatorController',
        $scope: scope
        $state: state
        ListingDataService: fakeListingDataService
        ListingEligibilityService: fakeListingEligibilityService
      return
    )

    describe 'scope defaults are set', ->
      it 'populates $scope.filters with filter values from ListingDataService', ->
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
            ListingDataService: fakeListingDataService
            ListingEligibilityService: fakeListingEligibilityService
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

          it 'calls function to store on filters in ListingDataService', ->
            expect(fakeListingEligibilityService.setEligibilityFilters)
              .toHaveBeenCalledWith(scope.filters)

          it 'changes state to dahlia.listings-for-rent', ->
            expect(state.go).toHaveBeenCalledWith('dahlia.listings-for-rent')

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

        it 'calls function to reset filters in ListingEligibilityService', ->
          expect(fakeListingEligibilityService.resetEligibilityFilters)
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
              ListingDataService: fakeListingDataService
              ListingEligibilityService: fakeListingEligibilityService
          )
          it 'returns true', ->
            expect(scope.hasCalculatedIncome()).toEqual(true)

        describe 'yearlyIncome is zero', ->
          it 'returns false', ->
            expect(scope.hasCalculatedIncome()).toEqual(false)

      describe 'goToIncomeCalculator', ->
        it 'calls function to store current filters into ListingEligibilityService',->
          scope.goToIncomeCalculator()
          expect(fakeListingEligibilityService.setEligibilityFilters).toHaveBeenCalledWith(scope.filters)
