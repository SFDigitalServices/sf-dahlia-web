IncomeCalculatorService = ($state) ->
  Service = {}
  Service.display = { intro: true, initialIncomeForm: false, incomeManagement: false, summary: false }
  Service.incomeSources = []
  Service.incomeSource = { source: undefined, value: undefined, frequency: undefined }
  Service.toggledIncomeEditForms = {}

  Service.showIncomeForm = () ->
    Service.display = {intro: false, initialIncomeForm: true, incomeManagement: false, summary: false}

  Service.showIncomeManagement = () ->
    Service.display = {intro: false, initialIncomeForm: false, incomeManagement: true, summary: false}

  Service.addIncomeSource = (incomeSource) ->
    Service._parseIncomeValue()
    Service.incomeSources.push(Service.incomeSource)
    Service._resetIncomeSource()

  Service.showSummaryPage = () ->
    Service.display = {intro: false, initialIncomeForm: false, summary: true}

  Service.returnToEligibility = (totalIncome) ->
    Service._resetDisplay()
    Service.incomeSources = []
    $state.go('dahlia.eligibility-estimator')

  Service.deleteIncome = (income) ->
    Service.incomeSources = Service.incomeSources.filter (e) -> e != income
    if Service.incomeSources.length == 0
      Service.showIncomeForm()

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

  Service._parseIncomeValue = () ->
    value = String(Service.incomeSource.value)
    Service.incomeSource.value = parseFloat(value.replace(/,/g, ''), 10)

  Service._resetIncomeSource = () ->
    Service.incomeSource =  {}

  Service._numberWithCommas = (number) ->
    # TURN INTO A FILTER
    parts = number.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    parts.join '.'

  Service._resetDisplay = () ->
    Service.display = { intro: true, initialIncomeForm: false, summary: false }

  return Service

IncomeCalculatorService.$inject = ['$state']

angular
  .module('dahlia.services')
  .service('IncomeCalculatorService', IncomeCalculatorService)
