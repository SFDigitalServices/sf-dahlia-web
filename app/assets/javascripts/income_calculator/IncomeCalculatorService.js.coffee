IncomeCalculatorService = () ->
  Service = {}
  Service.display = { intro: true, incomeForm: false }
  Service.incomeSources = []
  Service.incomeSource = { source: undefined, value: undefined, frequency: undefined }

  Service.showIncomeForm = () ->
    Service.display.intro = false
    Service.display.incomeForm = true

  Service.addIncomeSource = (incomeSource) ->
    Service._parseIncomeValue()
    Service.incomeSources.push(Service.incomeSource)
    Service._resetIncomeSource()

  Service._parseIncomeValue = () ->
    value = Service.incomeSource.value
    Service.incomeSource.value = parseFloat(value.replace(/,/g, ''), 10)

  Service._resetIncomeSource = () ->
    Service.incomeSource =  {}

  return Service

IncomeCalculatorService.$inject = []

angular
  .module('dahlia.services')
  .service('IncomeCalculatorService', IncomeCalculatorService)
