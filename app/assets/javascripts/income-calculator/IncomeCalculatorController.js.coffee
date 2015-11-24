IncomeCalculatorController = ($scope, IncomeCalculatorService) ->

  $scope.display = () ->
    IncomeCalculatorService.display

  $scope.incomeSources = () ->
    IncomeCalculatorService.incomeSources

  $scope.incomeSource = () ->
    IncomeCalculatorService.incomeSource

  $scope.uniqueId = (income) ->
    income.source + income.value + income.frequency

  $scope.showIncomeForm = () ->
    IncomeCalculatorService.showIncomeForm()

  $scope.incomeEditFormToggled = (uniqueId) ->
    IncomeCalculatorService.incomeEditFormToggled(uniqueId)

  $scope.showIncomeManagement = () ->
    IncomeCalculatorService.showIncomeManagement()

  $scope.toggleIncomeEditForm = (uniqueId) ->
    IncomeCalculatorService.toggleIncomeEditForm(uniqueId)

  $scope.addAdditionalIncome = () ->
    IncomeCalculatorService.addIncomeSource($scope.incomeSource)

  $scope.showSummaryPage = () ->
    IncomeCalculatorService.showSummaryPage()

  $scope.totalHouseholdIncome = () ->
    IncomeCalculatorService.calculateTotalYearlyIncome()

  $scope.returnToEligibility = (totalIncome) ->
    IncomeCalculatorService.returnToEligibility(totalIncome)

  $scope.deleteIncome = (income) ->
    IncomeCalculatorService.deleteIncome(income)

  $scope.additionalIncome =false

  $scope.toggleAdditionalIncomeForm = () ->
    $scope.additionalIncome = !$scope.additionalIncome

IncomeCalculatorController.$inject = ['$scope', 'IncomeCalculatorService']

angular
  .module('dahlia.controllers')
  .controller('IncomeCalculatorController', IncomeCalculatorController)
