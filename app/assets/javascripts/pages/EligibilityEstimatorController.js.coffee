############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

EligibilityEstimatorController = ($scope, $state, ListingService, IncomeCalculatorService) ->
  $scope.filter_defaults = ListingService.eligibility_filter_defaults
  $scope.filters = angular.copy(ListingService.eligibility_filters)

  # check if we've used the IncomeCalculator to calculate income
  if IncomeCalculatorService.calculateTotalYearlyIncome() > 0
    $scope.filters.income_total = IncomeCalculatorService.calculateTotalYearlyIncome()
    $scope.filters.income_timeframe = 'per_year'

  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false

  $scope.submitForm = () ->
    if ($scope.eligibilityForm.$valid)
      if !$scope.filters.income_total
        $scope.filters.income_timeframe = 'per_year'
        $scope.filters.income_total = 0
      ListingService.setEligibilityFilters($scope.filters)
      $state.go('dahlia.listings')
    else
      $scope.hideAlert = false

  $scope.clearForm = ->
    $scope.eligibilityForm.$setUntouched()
    $scope.eligibilityForm.$setPristine()
    $scope.hideAlert = false
    angular.copy($scope.filter_defaults, $scope.filters)
    ListingService.resetEligibilityFilters()
    IncomeCalculatorService.resetIncomeSources()

  $scope.inputInvalid = (name) ->
    form = $scope.eligibilityForm
    form[name].$invalid && (form[name].$touched || form.$submitted)

  $scope.isDefaultForm = ->
    angular.equals($scope.filter_defaults, $scope.filters)

  $scope.hasCalculatedIncome = ->
    IncomeCalculatorService.calculateTotalYearlyIncome() > 0

  $scope.goToIncomeCalculator = () ->
    # save our currently entered filters before we move on!
    ListingService.setEligibilityFilters($scope.filters)

  $scope.resetChildrenUnder6 = ->
    $scope.filters.children_under_6 = ""

  $scope.onChangeHouseholdSize = ->
    if $scope.filters.children_under_6 >= $scope.filters.household_size
      $scope.resetChildrenUnder6()
      $scope.filters.include_children_under_6 = false

############################################################################################
######################################## CONFIG ############################################
############################################################################################

EligibilityEstimatorController.$inject = ['$scope', '$state', 'ListingService', 'IncomeCalculatorService']

angular
  .module('dahlia.controllers')
  .controller('EligibilityEstimatorController', EligibilityEstimatorController)
