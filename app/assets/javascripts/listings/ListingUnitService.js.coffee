############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingUnitService = ($translate, $http, $q, ListingConstantsService, ListingIdentityService) ->
  Service = {}
  Service.loading = {}
  Service.error = {}
  # These get loaded after the listing is loaded.
  Service.AMICharts = []

  Service.resetData = () ->
    angular.copy([], Service.AMICharts)

  Service._sortGroupedUnits = (units) ->
    # little hack to re-sort Studio to the top
    _.map units, (u) ->
      u.Unit_Type = '000Studio' if u.Unit_Type == 'Studio'
      u.Unit_Type = '000SRO' if u.Unit_Type == 'SRO'
      return u
    # sort everything based on the order presented in pickList
    units = _.sortBy units, ListingConstantsService.fieldsForUnitGrouping
    # put "Studio" back to normal
    _.map units, (u) ->
      u.Unit_Type = 'Studio' if u.Unit_Type == '000Studio'
      u.Unit_Type = 'SRO' if u.Unit_Type == '000SRO'
      return u

  Service.unitAreaRange = (units) ->
    min = (_.minBy(units, 'Unit_Square_Footage') || {})['Unit_Square_Footage']
    max = (_.maxBy(units, 'Unit_Square_Footage') || {})['Unit_Square_Footage']
    if min != max
      "#{min} - #{max}"
    else
      min

  Service.combineUnitSummaries = (listing) ->
    # Combined unitSummary is useful e.g. for overall occupancy levels across the whole listing.
    listing.unitSummaries ?= {}
    combined = _.concat(listing.unitSummaries.reserved, listing.unitSummaries.general)
    combined = _.omitBy(_.uniqBy(combined, 'unitType'), _.isNil)
    # Rename the unitType field to match how individual units are labeled.
    _.map(combined, (u) -> u.Unit_Type = u.unitType)
    Service._sortGroupedUnits(combined)

  Service._sumSimilarUnits = (units) ->
    # Given ListingConstantsService.fieldsForUnitGrouping,
    # combine similar units, and add up the number of available units.
    summaries = []
    # Create an identity function to group by unique price and income
    group = _.groupBy units, (unit) ->
      _.flatten(_.toPairs(_.pick(unit, ListingConstantsService.fieldsForUnitGrouping)))
    _.forEach group, (groupedUnits, id) ->
      # Summarize each group by combining the unit details + # of units for that type/AMI combo.
      summary = _.pick(groupedUnits[0], ListingConstantsService.fieldsForUnitGrouping)
      summary.total = groupedUnits.length
      summaries.push(summary)
    summaries

  Service._getAnnualAMIAmount = (incomeList, occupancy) ->
    if incomeList && incomeList.values?
      _.find(incomeList['values'], {'numOfHousehold': occupancy})['amount']
    else
      console.error('Missing AMIs for occupancy', incomeList, occupancy)

  Service._convertMaxAnnualToMonthly = (maxAnnualIncome) ->
    # We round max incomes down to avoid users being surprised by being rejected.
    Math.floor(maxAnnualIncome/12).toFixed(0)

  Service._convertMinAnnualToMonthly = (minAnnualIncome) ->
    # We round min incomes up to avoid users being surprised by being rejected.
    Math.ceil(minAnnualIncome/12).toFixed(0)

  Service._getIncomeRangesByOccupancy = (unitGroup) ->
    # Given a row of units grouped by size, AMI, price, etc, determine the
    # min and max incomes for that range for every available occupancy size.
    # If a max occupancy isn't defined, as in the ownership case, default to showing up to 3
    # occupancy options.
    maxOccupancy = unitGroup.Max_Occupancy || unitGroup.Min_Occupancy + 2
    occupancyRange = [unitGroup.Min_Occupancy..maxOccupancy]
    # FIXME: This does not handle cases where listings have multiple AMI charts with the same percent.
    maxAMIs = _.find(Service.AMICharts, {'percent': unitGroup.Max_AMI_for_Qualifying_Unit.toString()})
    # Determine whether min income is from AMI or fixed
    if unitGroup.Min_AMI_for_Qualifying_Unit
      minAMIs = _.find(Service.AMICharts, {'percent': unitGroup.Min_AMI_for_Qualifying_Unit.toString()})

    occupancyRange.map( (occupancy) ->
      maxIncome = Service._convertMaxAnnualToMonthly(Service._getAnnualAMIAmount(maxAMIs, occupancy))
      if minAMIs
        minIncome = Service._convertMinAnnualToMonthly(Service._getAnnualAMIAmount(minAMIs, occupancy))
      else
        minIncome = unitGroup.BMR_Rental_Minimum_Monthly_Income_Needed.toString()
      return {
        'occupancy': occupancy,
        'maxIncome': maxIncome,
        'minIncome': minIncome
      }
    )

  Service._getIncomeLevelLabel = (unitSummary) ->
    # If a min AMI is present, show a range, otherwise show "up to X %"
    if unitSummary.Min_AMI_for_Qualifying_Unit
      label = $translate.instant(
        'listings.stats.percent_ami_range',
        {
          'minAmiPercent': unitSummary.Min_AMI_for_Qualifying_Unit,
          'maxAmiPercent': unitSummary.Max_AMI_for_Qualifying_Unit
        }
      )
    else
      label = $translate.instant(
        'listings.stats.up_to_percent_ami',
        {'amiPercent': unitSummary.Max_AMI_for_Qualifying_Unit}
      )
    label

  Service.groupRentalUnits = (units) ->
    ###
    Group rental units by number of people in houshold, % AMI, and unit type/price

    Returns an object of e.g. the form:
    [{
      "occupancy": "1",
      "minIncome": "2154",
      "maxIncome": "2154",
      "incomeLevels": [{
        "incomeLevel": "Up to 65% AMI",
        "priceGroups": [{
          "Unit_Type": "1 BR",
          "BMR_Rent_Monthly": 1170,
          "BMR_Rental_Minimum_Monthly_Income_Needed": 2340,
          "Max_AMI_for_Qualifying_Unit": 30,
          "Min_Occupancy": 1,
          "Max_Occupancy": 3,
          "Status": "Available",
          "total": 1,
          "occupancy": 1,
          "maxIncome": "2154",
          "minIncome": "2340"
        }, ...]
      }, ...]
    }, ...]

    ###
    # Sum similar units into individual rows
    similarUnits = Service._sumSimilarUnits(units)
    # Assign units to different household sizes + add income ranges
    byHHSize = {}
    # Get income ranges for rows and distribute into object by hh size.
    for row in similarUnits
      incomesByOccupancy = Service._getIncomeRangesByOccupancy(row)
      for incomeByOccupancy in incomesByOccupancy
        withIncomes = _.merge({}, row, incomeByOccupancy)
        occ = incomeByOccupancy['occupancy']
        byHHSize[occ] = _.concat(byHHSize[occ] || [], withIncomes)

    # Within each occupancy, group by AMI and sort
    groupedByHHSizeAndAmi = []
    for occupancy, rows of byHHSize
      groupedByAmi = _.groupBy rows, 'Max_AMI_for_Qualifying_Unit'
      incomeLevels = []
      unitGroupMinIncomes = []
      unitGroupMaxIncomes = []
      for ami, priceGroups of groupedByAmi
        incomeLevels.push({
          'incomeLevel': Service._getIncomeLevelLabel(priceGroups[0]),
          'priceGroups': Service._sortGroupedUnits(priceGroups)
        })
        unitGroupMinIncomes = unitGroupMinIncomes.concat(priceGroups.map((group) -> group.minIncome))
        unitGroupMaxIncomes = unitGroupMaxIncomes.concat(priceGroups.map((group) -> group.maxIncome))

      groupedByHHSizeAndAmi.push({
        occupancy: occupancy,
        minIncome: Math.min.apply(null, unitGroupMinIncomes),
        maxIncome: Math.max.apply(null, unitGroupMaxIncomes),
        incomeLevels: incomeLevels
      })
    groupedByHHSizeAndAmi

  Service.groupSaleUnits = (units) ->
    ###
    Group units by unit type, % AMI, and price

    Returns an object of e.g. the form:
    {
    "type": "Studio",
    "incomeLevels": [{
      "incomeLevel": "65",
      "priceGroups": [{
          "BMR_Rent_Monthly": 1700,
          "Status": "Available",
          "total": 1,
          ...,
          "incomeLimits": [{
              "occupancy": 1,
              "min_income": "3400",
              "max_income": "4671"
          }, ...]
        }, ...]
      }, ...]
    }
    ###
    # Group by unit type
    typeGroups = []
    groupedByType = _.groupBy units, 'Unit_Type'
    _.forEach groupedByType, (unitsGroupedByType, type) ->
      # Group by AMI
      incomeLevels = []
      groupedByAmi = _.groupBy unitsGroupedByType, 'Max_AMI_for_Qualifying_Unit'
      _.forEach groupedByAmi, (groupedByAmiAndType, percent) ->
        summaries = Service._sumSimilarUnits(groupedByAmiAndType)
        # Expand data to include income ranges by occupancy
        priceGroups = summaries.map((summary) ->
          _.merge(summary, {
            'incomeLimits': Service._sortGroupedUnits(Service._getIncomeRangesByOccupancy(summary))
          })
        )
        incomeLevels.push({
          'incomeLevel': Service._getIncomeLevelLabel(groupedByAmiAndType[0]),
          'priceGroups': Service._sortGroupedUnits(priceGroups)
        })
      typeGroups.push({
        'type': type,
        'incomeLevels': incomeLevels
      })
    return typeGroups

  Service.groupUnitTypes = (units) ->
    # Get a grouping of unit types across both "general" and "reserved"
    # for displaying unit details in the "features" section.
    grouped = _.groupBy units, 'Unit_Type'
    unitTypes = []
    _.forEach grouped, (groupedUnits, type) ->
      group = {}
      group.unitType = type
      group.units = groupedUnits
      group.unitAreaRange = Service.unitAreaRange(groupedUnits)
      unitTypes.push(group)
    unitTypes

  Service.groupSpecialUnits = (units, type) ->
    grouped = _.groupBy units, type
    delete grouped['undefined']
    grouped

  Service.getListingUnits = (listing, forceRecache = false) ->
    Service.loading.units = true
    Service.error.units = false
    httpConfig = {}
    httpConfig.params = { force: true } if forceRecache
    $http.get("/api/v1/listings/#{listing.Id}/units", httpConfig)
    .success((data, status, headers, config) ->
      Service.loading.units = false
      Service.error.units = false
      if data && data.units
        units = data.units
        listing.Units = units
        # We group sale + rental units differently
        listing.groupedUnits = if ListingIdentityService.isSale(listing) then Service.groupSaleUnits(units) else Service.groupRentalUnits(units)
        listing.unitTypes = Service.groupUnitTypes(units)
        listing.priorityUnits = Service.groupSpecialUnits(listing.Units, 'Priority_Type')
        listing.reservedUnits = Service.groupSpecialUnits(listing.Units, 'Reserved_Type')
    ).error( (data, status, headers, config) ->
      Service.loading.units = false
      Service.error.units = true
      return
    )

  Service.listingHasPriorityUnits = (listing) ->
    !_.isEmpty(listing.priorityUnits)

  Service.listingHasReservedUnits = (listing) ->
    !_.isEmpty(listing.unitSummaries.reserved)

  # `type` should match what we get from Salesforce e.g. "Veteran"
  Service.listingHasReservedUnitType = (listing, type) ->
    return false unless Service.listingHasReservedUnits(listing)
    types = _.map listing.reservedDescriptor, (descriptor) -> descriptor.name
    _.includes(types, type)

  Service.listingHasSROUnits = (listing) ->
    combined = Service.combineUnitSummaries(listing)
    _.some(combined, { Unit_Type: 'SRO' })

  Service.listingHasOnlySROUnits = (listing) ->
    combined = Service.combineUnitSummaries(listing)
    return false unless combined.length
    _.every(combined, { Unit_Type: 'SRO' })

  Service.getListingAMI = (listing) ->
    angular.copy([], Service.AMICharts)
    Service.loading.ami = true
    Service.error.ami = false
    # If chartTypes are not defined on the listing
    # e.g. if there are no units on the listing yet, exit early.
    return $q.when() unless listing.chartTypes
    allChartTypes = _.sortBy(listing.chartTypes, 'percent')
    data =
      'year[]': _.map(allChartTypes, 'year')
      'chartType[]': _.map(allChartTypes, 'chartType')
      'percent[]': _.map(allChartTypes, 'percent')
    $http.get('/api/v1/listings/ami.json', { params: data }).success((data, status, headers, config) ->
      if data && data.ami
        angular.copy(Service._consolidatedAMICharts(data.ami), Service.AMICharts)
      Service.loading.ami = false
    ).error( (data, status, headers, config) ->
      Service.loading.ami = false
      Service.error.ami = true
      return
    )

  Service._consolidatedAMICharts = (amiData) ->
    charts = []
    amiData.forEach (chart) ->
      # look for an existing chart at the same percentage level
      amiPercentChart = _.find charts, (c) -> c.percent == chart.percent
      if !amiPercentChart
        # only push chart if it has any values
        charts.push(chart) if chart.values.length
      else
        # if it exists, modify it with the max values
        i = 0
        amiPercentChart.values.forEach (incomeLevel) ->
          chartAmount = if chart.values[i] then chart.values[i].amount else 0
          incomeLevel.amount = Math.max(incomeLevel.amount, chartAmount)
          i++
    charts
  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingUnitService.$inject = ['$translate', '$http', '$q', 'ListingConstantsService', 'ListingIdentityService']

angular
  .module('dahlia.services')
  .service('ListingUnitService', ListingUnitService)
