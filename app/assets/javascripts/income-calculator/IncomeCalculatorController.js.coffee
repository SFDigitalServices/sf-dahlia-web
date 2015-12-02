IncomeCalculatorController = ($scope, IncomeCalculatorService) ->
  # initialization
  $scope.income = angular.copy(IncomeCalculatorService.defaultIncomeSource)
  $scope.incomeSources = IncomeCalculatorService.incomeSources
  # close all of the edit forms on controller init
  angular.forEach $scope.incomeSources, (income, i) ->
    income.editing = false

  $scope.noIncomeSources = ->
    $scope.incomeSources.length == 0

  $scope.hasIncomeSources = ->
    $scope.incomeSources.length > 0

  $scope.toggleIncomeEditForm = (income) ->
    # IncomeCalculatorService.toggleIncomeEditForm(income)
    income.editing = !income.editing

  $scope.addAdditionalIncome = () ->
    IncomeCalculatorService.addIncomeSource($scope.income)
    # reset $scope.income
    $scope.income = angular.copy(IncomeCalculatorService.defaultIncomeSource)

  $scope.totalHouseholdIncome = () ->
    IncomeCalculatorService.calculateTotalYearlyIncome()

  $scope.deleteIncome = (income) ->
    IncomeCalculatorService.deleteIncome(income)

  $scope.additionalIncome = false
  $scope.toggleAdditionalIncomeForm = () ->
    $scope.additionalIncome = !$scope.additionalIncome

IncomeCalculatorController.$inject = ['$scope', 'IncomeCalculatorService']

angular
  .module('dahlia.controllers')
  .controller('IncomeCalculatorController', IncomeCalculatorController)
