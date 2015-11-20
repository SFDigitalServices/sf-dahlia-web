IncomeCalculatorService = ($state) ->
  Service = {}
  Service.display = { intro: true, incomeForm: false, summary: false }
  Service.incomeSources = []
  Service.incomeSource = { source: undefined, value: undefined, frequency: undefined }

  Service.showIncomeForm = () ->
    Service.display.intro = false
    Service.display.incomeForm = true

  Service.addIncomeSource = (incomeSource) ->
    Service._parseIncomeValue()
    Service.incomeSources.push(Service.incomeSource)
    Service._resetIncomeSource()

  Service.showSummaryPage = () ->
    Service.display.intro = false
    Service.display.incomeForm = false
    Service.display.summary = true

  Service.returnToEligibility = () ->
    Service._resetDisplay()
    $state.go('dahlia.eligibility-estimator')

  Service.deleteIncome = (income) ->
    Service.incomeSources = Service.incomeSources.filter (e) -> e != income


  Service.calculateTotalYearlyIncome = () ->
    totalYearlyIncome = 0
    for source in Service.incomeSources
      if source.frequency == 'year'
        totalYearlyIncome = totalYearlyIncome + source.value
      else if source.frequency == 'month'
        totalYearlyIncome = totalYearlyIncome + (source.value * 12)
    return Service._numberWithCommas(totalYearlyIncome)

  Service._parseIncomeValue = () ->
    value = Service.incomeSource.value
    Service.incomeSource.value = parseFloat(value.replace(/,/g, ''), 10)

  Service._resetIncomeSource = () ->
    Service.incomeSource =  {}

  Service._numberWithCommas = (number) ->
    parts = number.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    parts.join '.'

  Service._resetDisplay = () ->
    Service.display = { intro: true, incomeForm: false, summary: false }

  return Service

IncomeCalculatorService.$inject = ['$state']

angular
  .module('dahlia.services')
  .service('IncomeCalculatorService', IncomeCalculatorService)
