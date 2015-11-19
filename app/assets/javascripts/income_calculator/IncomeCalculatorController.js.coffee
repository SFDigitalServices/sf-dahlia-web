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

IncomeCalculatorController.$inject = ['$scope', 'IncomeCalculatorService']

angular
  .module('dahlia.controllers')
  .controller('IncomeCalculatorController', IncomeCalculatorController)
