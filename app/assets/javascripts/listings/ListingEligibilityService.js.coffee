############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingEligibilityService = ($localStorage, ListingIdentityService, ListingUnitService) ->
  Service = {}
  Service.eligibility_filter_defaults =
    'household_size': ''
    'income_timeframe': ''
    'income_total': ''
    'include_children_under_6': false
    'children_under_6': ''

  $localStorage.eligibility_filters ?= angular.copy(Service.eligibility_filter_defaults)
  Service.eligibility_filters = $localStorage.eligibility_filters

  Service.setEligibilityFilters = (filters) ->
    angular.copy(filters, Service.eligibility_filters)

  Service.resetEligibilityFilters = ->
    angular.copy(Service.eligibility_filter_defaults, Service.eligibility_filters)

  Service.hasEligibilityFilters = ->
    hasIncome = Service.eligibility_filters.income_total >= 0 ? true : false
    !! (hasIncome &&
        Service.eligibility_filters.income_timeframe &&
        Service.eligibility_filters.household_size)

  Service.eligibilityYearlyIncome = ->
    if Service.eligibility_filters.income_timeframe == 'per_month'
      parseFloat(Service.eligibility_filters.income_total) * 12
    else
      parseFloat(Service.eligibility_filters.income_total)

  Service.occupancyMinMax = (listing) ->
    minMax = [1, 1]
    if listing.unitSummary
      min = _.min(_.map(listing.unitSummary, 'minOccupancy')) || 1
      max = _.max(_.map(listing.unitSummary, 'maxOccupancy')) || null
      minMax = [min, max]
    return minMax

  Service.maxAmiNumHousehold = (amiLevel) ->
    _.max(_.map(amiLevel.values, (v) -> v.numOfHousehold))

  Service.householdMinMaxForMaxIncomeTable = (listing, amiCharts) ->
    occupancyMinMax = Service.occupancyMinMax(listing)
    min = occupancyMinMax[0] || 1
    maxesForAmiCharts = amiCharts.map (amiLevel) -> Service.maxAmiNumHousehold(amiLevel)
    maxHhAvailable = Math.max(maxesForAmiCharts...)
    # We add '+ 2' for 2 children under 6 as part of householdsize but not occupancy
    # If occupancyMax is null (in the case of Sale listings) we show all available AMI rows.
    maxAllowed = if _.isNumber(occupancyMinMax[1]) then occupancyMinMax[1] + 2 else maxHhAvailable
    max = Math.min(maxAllowed, maxHhAvailable)

    # TO DO: Create long-term fix for some SRO units that allow 2 people.
    if (
      ListingIdentityService.listingIs('Merry Go Round Shared Housing', listing) ||
      ListingIdentityService.listingIs('1335 Folsom Street', listing) ||
      ListingIdentityService.listingIs('750 Harrison', listing) || 
      ListingIdentityService.listingIs('750 Harrison Unit 604', listing)
    )
      max = 2
    else if ListingUnitService.listingHasOnlySROUnits(listing)
      max = 1
    {'min': min, 'max': max}

  Service.occupancyIncomeLevels = (listing, amiChart) ->
    return [] unless amiChart
    minMax = Service.householdMinMaxForMaxIncomeTable(listing, [amiChart])
    _.filter amiChart.values, (value) ->
      value.numOfHousehold >= minMax.min && value.numOfHousehold <= minMax.max

  Service.hhSizesToShowInMaxIncomeTable = (listing, amiCharts) ->
    return [] unless amiCharts
    minMax = Service.householdMinMaxForMaxIncomeTable(listing, amiCharts)
    # array with values from min to max
    [minMax.min..minMax.max]


  Service.incomeForHouseholdSize = (amiChart, householdSize) ->
    incomeLevel = _.find amiChart.values, (value) ->
      value.numOfHousehold == householdSize
    return unless incomeLevel
    incomeLevel.amount

  Service.householdAMIChartCutoff = (listing) ->
    occupancyMinMax = Service.occupancyMinMax(listing)
    max = if _.isNumber(occupancyMinMax[1]) then occupancyMinMax[1] else 2
    # cutoff at 2x the num of bedrooms, with a minumum of 1
    Math.max(Math.floor(max/2) * 2, 1)

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingEligibilityService.$inject = ['$localStorage', 'ListingIdentityService', 'ListingUnitService']

angular
  .module('dahlia.services')
  .service('ListingEligibilityService', ListingEligibilityService)
