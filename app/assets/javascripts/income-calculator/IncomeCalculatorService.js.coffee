IncomeCalculatorService = ($localStorage) ->
  Service = {}
  Service.current_id = 1

  Service.defaultIncomeSource =
    id: undefined
    source: undefined
    value: undefined
    frequency: undefined
    editing: false

  $localStorage.incomeSources ?= []
  Service.incomeSources = $localStorage.incomeSources

  Service.nextId = ->
    max_id = Service.current_id
    for source in Service.incomeSources
      max_id = source.id if source.id > max_id
    Service.current_id = max_id + 1

  Service.addIncomeSource = (income) ->
    income.value = Service._parseIncomeValue(income.value)
    income.editing = false
    income.id = Service.nextId()
    Service.incomeSources.push(income)

  Service.newIncomeSource = ->
    income = angular.copy(Service.defaultIncomeSource)
    income.id = Service.nextId()
    income

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
    parseFloat(String(value).replace(/[^0-9\.]+/g, '') || 0).toFixed(2)

  return Service

IncomeCalculatorService.$inject = ['$localStorage']

angular
  .module('dahlia.services')
  .service('IncomeCalculatorService', IncomeCalculatorService)
