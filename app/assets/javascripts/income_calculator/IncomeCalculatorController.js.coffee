IncomeCalculatorController = ($scope, IncomeCalculatorService) ->

  $scope.display = IncomeCalculatorService.display

  $scope.incomeSources = () ->
    IncomeCalculatorService.incomeSources

  $scope.incomeSource = () ->
    IncomeCalculatorService.incomeSource

  $scope.showIncomeForm = () ->
    IncomeCalculatorService.showIncomeForm()

  $scope.addAdditionalIncome = () ->
    IncomeCalculatorService.addIncomeSource($scope.incomeSource)

  $scope.showSummaryPage = () ->
    IncomeCalculatorService.showSummaryPage()

  $scope.totalHouseholdIncome = () ->
    IncomeCalculatorService.calculateTotalYearlyIncome()

  $scope.returnToEligibility = () ->
    IncomeCalculatorService.returnToEligibility()

IncomeCalculatorController.$inject = ['$scope', 'IncomeCalculatorService']

angular
  .module('dahlia.controllers')
  .controller('IncomeCalculatorController', IncomeCalculatorController)
