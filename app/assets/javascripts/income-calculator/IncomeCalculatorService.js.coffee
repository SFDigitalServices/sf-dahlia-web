IncomeCalculatorService = ($localStorage) ->
  Service = {}
  Service.defaultIncomeSource =
    id: undefined
    source: undefined
    value: undefined
    frequency: undefined
    editing: false
  Service.current_id = 1

  $localStorage.incomeSources ?= []
  Service.incomeSources = $localStorage.incomeSources

  Service.addIncomeSource = (income) ->
    income.value = Service._parseIncomeValue(income.value)
    Service.current_id += 1
    income.id = Service.current_id
    Service.incomeSources.push(income)

  Service.deleteIncome = (income) ->
    incomeSources = Service.incomeSources.filter (e) -> e != income
    # persist the changes to Service.incomeSources / $localStorage
    angular.copy(incomeSources, Service.incomeSources)

  Service.resetIncomeSources = ->
    angular.copy([], Service.incomeSources)

  Service.calculateTotalYearlyIncome = ->
    totalYearlyIncome = 0
    for source in Service.incomeSources
      source.value = Service._parseIncomeValue(source.value)
      if source.frequency == 'year'
        totalYearlyIncome = totalYearlyIncome + source.value
      else if source.frequency == 'month'
        totalYearlyIncome = totalYearlyIncome + (source.value * 12)
    totalYearlyIncome

  Service.noIncomeEditing = () ->
    for source in Service.incomeSources
      if source.editing == true
        return true
    return false

  Service._parseIncomeValue = (value) ->
    parseFloat(String(value).replace(/,/g, ''), 10)

  return Service

IncomeCalculatorService.$inject = ['$localStorage']

angular
  .module('dahlia.services')
  .service('IncomeCalculatorService', IncomeCalculatorService)
