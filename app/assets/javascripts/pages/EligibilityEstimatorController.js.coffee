############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

EligibilityEstimatorController = ($scope, $state, ListingService, IncomeCalculatorService) ->
  $scope.filter_defaults = ListingService.eligibility_filter_defaults
  $scope.filters = angular.copy(ListingService.eligibility_filters)

  # check if we've used the IncomeCalculator to calculate income
  if IncomeCalculatorService.totalYearlyIncome() > 0
    $scope.filters.income_total = IncomeCalculatorService.totalYearlyIncome()
    $scope.filters.income_timeframe = 'per_year'

  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false

  $scope.submitForm = () ->
    if ($scope.eligibilityForm.$valid)
      # submit
      ListingService.setEligibilityFilters($scope.filters)
      $state.go('dahlia.listings')
    else
      $scope.hideAlert = false

  $scope.clearForm = ->
    $scope.eligibilityForm.$setUntouched()
    $scope.eligibilityForm.$setPristine()
    $scope.hideAlert = false
    angular.copy($scope.filter_defaults, $scope.filters)
    ListingService.setEligibilityFilters($scope.filters)
    IncomeCalculatorService.resetIncomeSources()

  $scope.inputInvalid = (name) ->
    form = $scope.eligibilityForm
    form[name].$invalid && (form[name].$touched || form.$submitted)

  $scope.showAlert = ->
    form = $scope.eligibilityForm
    # show alert if we've submitted an invalid form, and we haven't manually hidden it
    form.$submitted && form.$invalid && $scope.hideAlert == false

  $scope.isDefaultForm = ->
    angular.equals($scope.filter_defaults, $scope.filters)

  $scope.hasCalculatedIncome = ->
    IncomeCalculatorService.totalYearlyIncome() > 0


############################################################################################
######################################## CONFIG ############################################
############################################################################################

EligibilityEstimatorController.$inject = ['$scope', '$state', 'ListingService', 'IncomeCalculatorService']

angular
  .module('dahlia.controllers')
  .controller('EligibilityEstimatorController', EligibilityEstimatorController)
