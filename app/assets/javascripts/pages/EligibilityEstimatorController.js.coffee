############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

EligibilityEstimatorController = ($scope, $state, ListingService, IncomeCalculatorService) ->
  formDefaults =
    'household_size': ''
    'income_timeframe': ''
    'income_total': ''

  # check if we need to pre-populate the form with our stored filters
  unless angular.equals({}, ListingService.getEligibilityFilters())
    $scope.filters = ListingService.getEligibilityFilters()

  # check if we've used the IncomeCalculator to calculate income
  if IncomeCalculatorService.totalYearlyIncome() > 0
    $scope.filters.income_total = IncomeCalculatorService.totalYearlyIncome()
    $scope.filters.income_timeframe = 'per_year'


  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false

  $scope.submitForm = () ->
    # for now, this doesn't actually "submit", it just clears the form
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
    $scope.filters = angular.copy(formDefaults)
    ListingService.setEligibilityFilters({})

  $scope.inputInvalid = (name) ->
    form = $scope.eligibilityForm
    form[name].$invalid && (form[name].$touched || form.$submitted)

  $scope.showAlert = ->
    form = $scope.eligibilityForm
    # show alert if we've submitted an invalid form, and we haven't manually hidden it
    form.$submitted && form.$invalid && $scope.hideAlert == false

  $scope.isDefaultForm = ->
    angular.equals(formDefaults, $scope.filters)

  $scope.hasCalculatedIncome = ->
    IncomeCalculatorService.totalYearlyIncome() > 0


############################################################################################
######################################## CONFIG ############################################
############################################################################################

EligibilityEstimatorController.$inject = ['$scope', '$state', 'ListingService', 'IncomeCalculatorService']

angular
  .module('dahlia.controllers')
  .controller('EligibilityEstimatorController', EligibilityEstimatorController)
