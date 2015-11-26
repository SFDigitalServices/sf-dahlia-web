IncomeCalculatorService = ($localStorage) ->
  Service = {}
  Service.defaultIncomeSource =
    source: undefined
    value: undefined
    frequency: undefined
    editing: false

  $localStorage.incomeSources ?= []
  Service.incomeSources = $localStorage.incomeSources

  Service.addIncomeSource = (income) ->
    income.value = Service._parseIncomeValue(income.value)
    Service.incomeSources.push(income)

  Service.deleteIncome = (income) ->
    incomeSources = Service.incomeSources.filter (e) -> e != income
    # persist the changes to Service.incomeSources / $localStorage
    angular.copy(incomeSources, Service.incomeSources)

  Service.resetIncomeSources = ->
    angular.copy([], Service.incomeSources)

  Service.totalYearlyIncome = ->
    totalYearlyIncome = 0
    for source in Service.incomeSources
      source.value = Service._parseIncomeValue(source.value)
      if source.frequency == 'year'
        totalYearlyIncome = totalYearlyIncome + source.value
      else if source.frequency == 'month'
        totalYearlyIncome = totalYearlyIncome + (source.value * 12)
    totalYearlyIncome

  Service.formattedYearlyIncome = ->
    Service._numberWithCommas(Service.totalYearlyIncome())

  Service._parseIncomeValue = (value) ->
    parseFloat(String(value).replace(/,/g, ''), 10)

  Service._numberWithCommas = (number) ->
    # TURN INTO A FILTER
    parts = number.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    parts.join '.'

  return Service

IncomeCalculatorService.$inject = ['$localStorage']

angular
  .module('dahlia.services')
  .service('IncomeCalculatorService', IncomeCalculatorService)
