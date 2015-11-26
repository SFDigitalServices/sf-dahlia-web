IncomeCalculatorService = ($state, $localStorage) ->
  Service = {}
  Service.defaultIncomeSource =
    source: undefined
    value: undefined
    frequency: undefined
    editing: false

  # Service.toggledIncomeEditForms = {}
  # Service.incomeSources = []
  Service.incomeSources = $localStorage.incomeSources || []

  Service.addIncomeSource = (income) ->
    income.value = Service._parseIncomeValue(income.value)
    Service.incomeSources.push(income)
    # Service._resetIncomeSource()

  Service.deleteIncome = (income) ->
    incomeSources = Service.incomeSources.filter (e) -> e != income
    # persist the changes to Service.incomeSources / $localStorage
    angular.copy(incomeSources, Service.incomeSources)

  Service.calculateTotalYearlyIncome = () ->
    totalYearlyIncome = 0
    for source in Service.incomeSources
      if source.frequency == 'year'
        totalYearlyIncome = totalYearlyIncome + source.value
      else if source.frequency == 'month'
        totalYearlyIncome = totalYearlyIncome + (source.value * 12)
    return Service._numberWithCommas(totalYearlyIncome)

  Service.toggleIncomeEditForm = (uniqueId) ->
    Service.toggledIncomeEditForms[uniqueId] = !Service.toggledIncomeEditForms[uniqueId]

  Service.incomeEditFormToggled = (uniqueId) ->
    Service.toggledIncomeEditForms[uniqueId]

  Service._parseIncomeValue = (value) ->
    parseFloat(String(value).replace(/,/g, ''), 10)

  # Service._resetIncomeSource = () ->
  #   Service.incomeSource =  {}

  Service._numberWithCommas = (number) ->
    # TURN INTO A FILTER
    parts = number.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    parts.join '.'

  return Service

IncomeCalculatorService.$inject = ['$state', '$localStorage']

angular
  .module('dahlia.services')
  .service('IncomeCalculatorService', IncomeCalculatorService)
