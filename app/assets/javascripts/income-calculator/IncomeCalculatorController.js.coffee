IncomeCalculatorController = ($scope, IncomeCalculatorService) ->
  # initialization
  $scope.forms = {}
  $scope.income = angular.copy(IncomeCalculatorService.defaultIncomeSource)
  $scope.incomeSources = IncomeCalculatorService.incomeSources
  # close all of the edit forms on controller init
  angular.forEach $scope.incomeSources, (income, i) ->
    income.editing = false
  $scope.additionalIncome = false
  $scope.additionalIncomeClass = "tint"

  $scope.noIncomeSources = ->
    $scope.incomeSources.length == 0

  $scope.hasIncomeSources = ->
    $scope.incomeSources.length > 0

  $scope.toggleIncomeEditForm = (income) ->
    income.editing = !income.editing

  $scope.form = (id) ->
    $scope.forms["incomeForm_#{id}"]

  $scope.inputInvalid = (formId, name) ->
    if form = $scope.form(formId)
      if form[name]
        form[name].$invalid && (form[name].$touched || form.$submitted)

  $scope.addAdditionalIncome = () ->
    # this is where we should add validation checking!
    form = $scope.form($scope.income.id)
    if form && form.$invalid
      # trigger error messages by setting form to submitted
      form.$setSubmitted()
    else
      IncomeCalculatorService.addIncomeSource($scope.income)
      form.$setUntouched() if form
      form.$setPristine() if form
      $scope.resetIncomeSource()
      $scope.closeAdditionalIncomeForm()

  $scope.resetIncomeSource = ->
    $scope.income = IncomeCalculatorService.newIncomeSource()
    $scope.additionalIncomeClass = "tint"

  $scope.totalHouseholdIncome = () ->
    IncomeCalculatorService.calculateTotalYearlyIncome()

  $scope.deleteIncome = (income) ->
    IncomeCalculatorService.deleteIncome(income)

  $scope.toggleAdditionalIncomeForm = () ->
    $scope.additionalIncomeClass = if $scope.additionalIncomeClass == 'tint' then 'tertiary' else 'tint'
    $scope.additionalIncome = !$scope.additionalIncome

  $scope.closeAdditionalIncomeForm = () ->
    $scope.additionalIncome = false

  $scope.nextId = ->
    IncomeCalculatorService.nextId()

  $scope.cleanValue = (income) ->
    income.value = $scope.parsedValue(income.value)

  $scope.parsedValue = (value) ->
    IncomeCalculatorService._parseIncomeValue(value)

IncomeCalculatorController.$inject = ['$scope', 'IncomeCalculatorService']

angular
  .module('dahlia.controllers')
  .controller('IncomeCalculatorController', IncomeCalculatorController)
