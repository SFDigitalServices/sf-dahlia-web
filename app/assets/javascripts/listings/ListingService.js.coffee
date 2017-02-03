############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingService = ($http, $localStorage, $modal, $q, $state, $translate) ->
  Service = {}
  Service.listing = {}
  Service.listings = []
  Service.openListings = []
  Service.openMatchListings = []
  Service.openNotMatchListings = []
  Service.closedListings = []
  Service.lotteryResultsListings = []
  # these get loaded after the listing is loaded
  Service.AMICharts = []
  Service.loading = {}
  Service.displayLotteryResultsListings = false

  Service.fieldsForUnitGrouping = [
    'Unit_Type',
    'Reserved_Type',
    'BMR_Rent_Monthly',
    'BMR_Rental_Minimum_Monthly_Income_Needed',
    'Rent_percent_of_income',
    'Status',
  ]


  $localStorage.favorites ?= []
  Service.favorites = $localStorage.favorites

  Service.eligibility_filter_defaults =
    'household_size': ''
    'income_timeframe': ''
    'income_total': ''
    'include_children_under_6': false
    'children_under_6': ''

  $localStorage.eligibility_filters ?= angular.copy(Service.eligibility_filter_defaults)
  Service.eligibility_filters = $localStorage.eligibility_filters

  Service.getFavoriteListings = () ->
    Service.getListingsByIds(Service.favorites, true)

  # Service.checkFavorites makes sure that Service.listings contains our favorited listings
  # if not, it means the listing doesn't exist and we should remove it from favorites
  Service.checkFavorites = () ->
    listing_ids = []
    Service.listings.forEach (listing) -> listing_ids.push(listing['Id'])
    Service.favorites.forEach (favorite_id) ->
      if listing_ids.indexOf(favorite_id) == -1
        Service.toggleFavoriteListing(favorite_id)


  Service.toggleFavoriteListing = (listing_id) ->
    # toggle the value for listing_id
    index = Service.favorites.indexOf(listing_id)
    if index == -1
      # add the favorite
      Service.favorites.push(listing_id)
    else
      # remove the favorite
      Service.favorites.splice(index, 1)

  Service.isFavorited = (listing_id) ->
    Service.favorites.indexOf(listing_id) > -1

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
      min = _.min(_.map(listing.unitSummary, 'minOccupancy'))
      max = _.max(_.map(listing.unitSummary, 'maxOccupancy')) || 2
      minMax = [min, max]
    return minMax

  Service.hasPreference = (preference) ->
    preferenceNames = _.map(Service.listing.preferences, (pref) -> pref.preferenceName)
    preferenceMap =
      certOfPreference: "Certificate of Preference (COP)"
      displaced: "Displaced Tenant Housing Preference (DTHP)"
      liveWorkInSf: "Live or Work in San Francisco Preference"
      liveInSf: "Live or Work in San Francisco Preference"
      workInSf: "Live or Work in San Francisco Preference"
      neighborhoodResidence: "Neighborhood Resident Housing Preference (NRHP)"

    # look up the full name of the preference (i.e. "workInSf" -> "Live/Work Preference")
    preferenceName = preferenceMap[preference]
    return _.includes(preferenceNames, preferenceName)

  Service.maxIncomeLevelsFor = (listing, ami) ->
    occupancyMinMax = Service.occupancyMinMax(listing)
    incomeLevels = []
    ami.forEach (amiLevel) ->
      occupancy = parseInt(amiLevel.numOfHousehold)
      # only grab the incomeLevels that fit within our listing's occupancyMinMax
      # + we add 2 more to account for potential childrenUnder6
      min = occupancyMinMax[0]
      max = occupancyMinMax[1] + 2
      if occupancy >= min && occupancy <= max
        incomeLevels.push({
          occupancy: occupancy,
          yearly: parseFloat(amiLevel.amount),
          monthly: Math.floor(parseFloat(amiLevel.amount) / 12.0)
        })
    return incomeLevels

  Service.openLotteryResultsModal = ->
    modalInstance = $modal.open({
      templateUrl: 'listings/templates/listing/_lottery_modal.html',
      controller: 'ModalInstanceController',
      windowClass: 'modal-small'
    })

  Service.listingHasLotteryBuckets = ->
    Service.listing.Lottery_Buckets &&
    _.some(Service.listing.Lottery_Buckets.bucketResults, (pref) -> !_.isEmpty(pref.bucketResults))

  Service.formattedAddress = (listing, type='Building', display='full') ->
    # If Street address is undefined, then return false for display and google map lookup
    if listing["#{type}_Street_Address"] == undefined
      return
    # If other fields are undefined, proceed, with special string formatting
    if listing["#{type}_Street_Address"] != undefined
      Street_Address = listing["#{type}_Street_Address"] + ', '
    else
      Street_Address = ''
    if listing["#{type}_City"] != undefined
      City = listing["#{type}_City"]
    else
      City = ''
    if listing["#{type}_State"] != undefined
      State = listing["#{type}_State"]
    else
      State = ''
    if type == 'Application'
      zip_code_field = "#{type}_Postal_Code"
    else
      zip_code_field = "#{type}_Zip_Code"
    if listing[zip_code_field] != undefined
      Zip_Code = listing[zip_code_field]
    else
      Zip_Code = ''

    if display == 'street'
      return "#{Street_Address}"
    else if display == 'city-state-zip'
      return "#{City} #{State}, #{Zip_Code}"
    else
      "#{Street_Address}#{City} #{State}, #{Zip_Code}"

  Service.showNeighborhoodPreferences = (listing) ->
    return false unless listing.NeighborHoodPreferenceUrl
    now = moment()
    lotteryDate = moment(listing.Lottery_Date)
    begin = lotteryDate.clone().subtract(9, 'days')
    end = lotteryDate.clone().subtract(2, 'days')
    return now > begin && now < end

  Service.sortByDate = (sessions) ->
    # used for sorting Open_Houses and Information_Sessions
    _.sortBy sessions, (session) ->
      moment("#{session.Date} #{session.Start_Time}", 'YYYY-MM-DD h:mmA')

  Service.calculateNumberOfAvailableUnits = (listing) ->
    units = _.filter listing.Units, (unit) ->
      unit.Status == "Available"
    listing.numberOfAvailableUnits = units.length

  Service.allListingUnitsAvailable = (listing) ->
    listing.numberOfAvailableUnits == listing.Units.length

  ###################################### Salesforce API Calls ###################################

  Service.getListing = (_id) ->
    _id = Service.mapSlugToId(_id)
    if Service.listing && Service.listing.Id == _id
      # return a resolved promise if we already have the listing
      return $q.when(Service.listing)
    angular.copy({}, Service.listing)
    $http.get("/api/v1/listings/#{_id}.json").success((data, status, headers, config) ->
      angular.copy((if data and data.listing then data.listing else {}), Service.listing)
      # TODO: -- REMOVE HARDCODED FEATURES --
      if Service.listingIs('Test Listing')
        Service.listing = Service.stubFeatures(Service.listing)
      # create a combined unitSummary
      unless Service.listing.unitSummary
        Service.listing.unitSummary = Service.combineUnitSummaries(Service.listing)
    ).error( (data, status, headers, config) ->
      return
    )

  Service.getListings = (opts = {}) ->
    # check for eligibility options being set in the session
    if opts.checkEligibility && Service.hasEligibilityFilters()
      return Service.getListingsWithEligibility()
    $http.get("/api/v1/listings.json").success((data, status, headers, config) ->
      listings = if data and data.listings then data.listings else []
      Service.groupListings(listings)
      Service.displayLotteryResultsListings = !Service.openListings.length
    ).error( (data, status, headers, config) ->
      return
    )

  Service.getListingsWithEligibility = ->
    params =
      eligibility:
        householdsize: Service.eligibility_filters.household_size
        incomelevel: Service.eligibilityYearlyIncome()
        includeChildrenUnder6: Service.eligibility_filters.include_children_under_6
        childrenUnder6: Service.eligibility_filters.children_under_6
    $http.post("/api/v1/listings/eligibility.json", params).success((data, status, headers, config) ->
      listings = (if data and data.listings then data.listings else [])
      Service.groupListings(listings)
    ).error( (data, status, headers, config) ->
      return
    )

  Service.groupListings = (listings) ->
    angular.copy([], Service.openListings)
    angular.copy([], Service.openMatchListings)
    angular.copy([], Service.openNotMatchListings)
    angular.copy([], Service.closedListings)
    angular.copy([], Service.lotteryResultsListings)
    listings.forEach (listing) ->
      # TODO: -- REMOVE HARDCODED FEATURES --
      if Service.listingIs('Test Listing', listing)
        listing = Service.stubFeatures(listing)
      if Service.listingIsOpen(listing)
        # All Open Listings Array
        Service.openListings.push(listing)
        if listing.Does_Match
          Service.openMatchListings.push(listing)
        else
          Service.openNotMatchListings.push(listing)
      else if !Service.listingIsOpen(listing)
        if listing.Lottery_Results
          Service.lotteryResultsListings.push(listing)
        else
          Service.closedListings.push(listing)
    Service.sortListings()

  Service.sortListings = ->
    # openListing types
    ['openListings', 'openMatchListings', 'openNotMatchListings'].forEach (type) ->
      Service[type] = _.sortBy(Service[type], (i) -> moment(i.Application_Due_Date))
    # closedListing types
    ['closedListings', 'lotteryResultsListings'].forEach (type) ->
      Service[type] = _.sortBy(Service[type], (i) -> moment(i.Lottery_Results_Date))
    # lotteryResults get reversed (latest lottery results date first)
    Service.lotteryResultsListings = _.reverse(Service.lotteryResultsListings)


  # retrieves only the listings specified by the passed in array of ids
  Service.getListingsByIds = (ids, checkFavorites = false) ->
    angular.copy([], Service.listings)
    params = {params: {ids: ids.join(',') }}
    $http.get("/api/v1/listings.json", params).success((data, status, headers, config) ->
      listings = if data and data.listings then data.listings else []
      angular.copy(listings, Service.listings)
      Service.checkFavorites() if checkFavorites
    ).error( (data, status, headers, config) ->
      return
    )

  # Business logic for determining if a listing is open
  # `due date` should be a datetime, to include precise hour of deadline
  Service.listingIsOpen = (listing) ->
    return false unless listing.Application_Due_Date
    now = moment()
    deadline = moment(listing.Application_Due_Date).tz('America/Los_Angeles')
    # listing is open if deadline is in the future
    return deadline > now

  Service.listingIsReservedCommunity = (listing) ->
    !! listing.Reserved_community_type

  Service.isAcceptingOnlineApplications = (listing) ->
    return false if _.isEmpty(listing)
    return false unless Service.listingIsOpen(listing)
    return listing.Accepting_Online_Applications

  Service.getListingAndCheckIfOpen = (id) ->
    Service.getListing(id).then ->
      if _.isEmpty(Service.listing)
        # kick them out unless there's a real listing
        return $state.go('dahlia.welcome')
      else if !Service.isAcceptingOnlineApplications(Service.listing)
        # kick them back to the listing
        return $state.go('dahlia.listing', {id: id})

  Service.getListingAMI = ->
    angular.copy([], Service.AMICharts)
    if Service.listing.chartTypes
      params =
        ami: _.sortBy(Service.listing.chartTypes, 'percent')
    else
      # TODO: do we actually want/need this fallback?
      # listing.chartTypes *should* always exist now
      percent = Service.listing.AMI_Percentage || 100
      params = { ami: [{year: '2016', chartType: 'Non-HERA', percent: percent}] }
    $http.post('/api/v1/listings/ami.json', params).success((data, status, headers, config) ->
      if data && data.ami
        angular.copy(Service._consolidatedAMICharts(data.ami), Service.AMICharts)
    ).error( (data, status, headers, config) ->
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
          incomeLevel.amount = Math.max(incomeLevel.amount, chart.values[i].amount)
          i++
    charts


  Service.getListingUnits = ->
    # angular.copy([], Service.listing.Units)
    $http.get("/api/v1/listings/#{Service.listing.Id}/units").success((data, status, headers, config) ->
      if data && data.units
        units = data.units
        # TODO: -- REMOVE HARDCODED FEATURES --
        if Service.listingIs('Test Listing')
          units = Service.stubUnitFeatures(units)
        # ---
        Service.listing.Units = units
        # TODO: remove after we get this field from salesforce
        Service.calculateNumberOfAvailableUnits(Service.listing)
        Service.listing.groupedUnits = Service.groupUnitDetails(units)
        Service.listing.unitTypes = Service.groupUnitTypes(units)
        Service.listing.priorityUnits = Service.groupSpecialUnits(Service.listing.Units, 'Priority_Type')
        Service.listing.reservedUnits = Service.groupSpecialUnits(Service.listing.Units, 'Reserved_Type')
    ).error( (data, status, headers, config) ->
      return
    )

  Service.groupUnitDetails = (units) ->
    grouped = _.groupBy units, 'of_AMI_for_Pricing_Unit'
    flattened = {}
    _.forEach grouped, (amiUnits, percent) ->
      flattened[percent] = []
      grouped[percent] = _.groupBy amiUnits, (unit) ->
        # create an identity function to group by all unit features in the pickList
        _.flatten(_.toPairs(_.pick(unit, Service.fieldsForUnitGrouping)))
      _.forEach grouped[percent], (groupedUnits, id) ->
        # summarize each group by combining the unit details + total # of units
        summary = _.pick(groupedUnits[0], Service.fieldsForUnitGrouping)
        summary.total = groupedUnits.length
        flattened[percent].push(summary)

      # make sure each array is sorted according to our desired order
      flattened[percent] = Service._sortGroupedUnits(flattened[percent])
    return flattened

  Service._sortGroupedUnits = (units) ->
    # little hack to re-sort Studio to the top
    _.map units, (u) ->
      u.Unit_Type = '000Studio' if u.Unit_Type == 'Studio'
      return u
    # sort everything based on the order presented in pickList
    units = _.sortBy units, Service.fieldsForUnitGrouping
    # put "Studio" back to normal
    _.map units, (u) ->
      u.Unit_Type = 'Studio' if u.Unit_Type == '000Studio'
      return u

  Service.groupUnitTypes = (units) ->
    # get a grouping of unit types across both "general" and "reserved"
    grouped = _.groupBy units, 'Unit_Type'
    unitTypes = []
    _.forEach grouped, (groupedUnits, type) ->
      group = {}
      group.unitType = type
      group.units = groupedUnits
      group.unitAreaRange = Service.unitAreaRange(groupedUnits)
      unitTypes.push(group)
    unitTypes

  Service.unitAreaRange = (units) ->
    min = (_.minBy(units, 'Unit_Square_Footage') || {})['Unit_Square_Footage']
    max = (_.maxBy(units, 'Unit_Square_Footage') || {})['Unit_Square_Footage']
    if min != max
      "#{min} - #{max}"
    else
      min

  Service.groupSpecialUnits = (units, type) ->
    grouped = _.groupBy units, type
    delete grouped['undefined']
    grouped

  Service.combineUnitSummaries = (listing) ->
    # combined unitSummary is useful e.g. for overall occupancy levels across the whole listing
    listing.unitSummaries ?= {}
    combined = _.concat(listing.unitSummaries.reserved, listing.unitSummaries.general)
    _.uniqBy(combined, 'unitType')

  Service.listingHasPriorityUnits = (listing) ->
    !_.isEmpty(listing.priorityUnits)

  Service.listingHasReservedUnits = (listing) ->
    !_.isEmpty(listing.reservedUnits)

  Service.reservedTypes = (listing) ->
    Service.collectTypes(listing.reservedDescriptor)

  Service.priorityTypes = (listing) ->
    Service.collectTypes(listing.prioritiesDescriptor)

  Service.collectTypes = (list) ->
    types = []
    _.each list, (descriptor) ->
      types.push(descriptor.name) if descriptor.name
    if types.length then types.join(', ') else ''

  Service.specialUnitTypeDescription = (type) ->
    switch type
      when 'Senior'
        $translate.instant("LISTINGS.RESERVED_SENIOR_DESCRIPTION")
      when 'Veteran'
        $translate.instant("LISTINGS.RESERVED_VETERAN_DESCRIPTION")
      when 'Developmental disabilities'
        $translate.instant("LISTINGS.RESERVED_DEVELOPMENTALLY_DISABLED_DESCRIPTION")
      when 'Hearing/Vision impaired'
        ,'Vision impaired'
        ,'Hearing impaired'
          $translate.instant("LISTINGS.PRIORITY_HEARING_VISION_IMPAIRED_DESCRIPTION")
      when 'Mobility impaired'
        $translate.instant("LISTINGS.PRIORITY_MOBILITY_IMPAIRED_DESCRIPTION")

  Service.getListingPreferences = ->
    # TODO: -- REMOVE HARDCODED FEATURES --
    Service.stubListingPreferences()
    # if this listing had stubbed preferences then we can abort
    return if !_.isEmpty(Service.listing.preferences)
    ## <--
    $http.get("/api/v1/listings/#{Service.listing.Id}/preferences").success((data, status, headers, config) ->
      if data && data.preferences
        Service.listing.preferences = data.preferences
    ).error( (data, status, headers, config) ->
      return
    )

  Service.getLotteryBuckets = ->
    Service.listing.Lottery_Buckets = {}
    Service.loading.lotteryResults = true
    $http.get("/api/v1/listings/#{Service.listing.Id}/lottery_buckets").success((data, status, headers, config) ->
      Service.loading.lotteryResults = false
      if data && data.lottery_buckets.bucketResults
        angular.copy(data.lottery_buckets, Service.listing.Lottery_Buckets)
    ).error( (data, status, headers, config) ->
      Service.loading.lotteryResults = false
      return
    )

  Service.getLotteryRanking = (lotteryNumber) ->
    params =
      params:
        lottery_number: lotteryNumber
    $http.get("/api/v1/listings/#{Service.listing.Id}/lottery_ranking", params).success((data, status, headers, config) ->
      if data && data.lottery_ranking
        Service.listing.Lottery_Ranking = data.lottery_ranking
    ).error( (data, status, headers, config) ->
      return
    )

  Service.occupancyIncomeLevels = (amiLevel) ->
    return [] unless amiLevel
    occupancyMinMax = Service.occupancyMinMax(Service.listing)
    min = occupancyMinMax[0]
    max = occupancyMinMax[1] + 2
    _.filter amiLevel.values, (value) ->
      # where numOfHousehold >= min && <= max
      value.numOfHousehold >= min && value.numOfHousehold <= max

  Service.householdAMIChartCutoff = ->
    occupancyMinMax = Service.occupancyMinMax(Service.listing)
    max = occupancyMinMax[1]
    # cutoff at 2x the num of bedrooms
    Math.floor(max/2) * 2

  Service.minYearlyIncome = ->
    return if _.isEmpty(Service.AMICharts)
    incomeLevels = Service.occupancyIncomeLevels(_.first(Service.AMICharts))
    # get the first (lowest) income level amount
    _.first(incomeLevels).amount

  Service.incomeForHouseholdSize = (amiChart, householdIncomeLevel) ->
    incomeLevel = _.find amiChart.values, (value) ->
      value.numOfHousehold == householdIncomeLevel.numOfHousehold
    return unless incomeLevel
    incomeLevel.amount

  # TODO: -- REMOVE HARDCODED FEATURES --
  Service.LISTING_MAP = {
    # can also serve as slugToId map for applicable listings
    'a0WU000000DBJ9YMAX': '480 Potrero'
    'a0WU000000BdZWlMAN': 'Alchemy'
    'a0W0P00000DYQpCUAX': '21 Clarence'
    'a0W0P00000DYPP7UAP': '168 Hyde'
    'a0W0P00000DYN6BUAX': 'Olume'
    'a0WU000000BcwrAMAR': 'Rincon'
    'a0WU000000C3hBWMAZ': 'Potrero 1010'
    'a0WU000000C4FsQMAV': '529 Stevenson'
    'a0WU000000D9iF8MAJ': '888 Paris'
    'a0WU000000DB97cMAD': '77 Bluxome'
    'a0W0P00000DYbAYUA1': '3445 Geary'
    'a0W0P00000DYgtDUAT': '125 Mason'
    'a0W0P00000DYiwiUAD': 'Argenta 909'
    'a0W0P00000DYm1xUAD': 'Northpoint Vistas'
    'a0W0P00000DYlxMUAT': '280 Brighton'
    'a0W0P00000DYuFSUA1': '30 Dore'
    'a0W0P00000DYxphUAD': '168 Hyde Relisting'
    'a0W0P00000DZ4dTUAT': 'L Seven'
    'a0W6C000000DbnZUAS': 'Test Listing'
  }

  Service.mapSlugToId = (id) ->
    # strip spaces and lowercase the listing names e.g. "Argenta 909" => "argenta909"
    mapping = _.mapKeys _.invert(Service.LISTING_MAP), (v, k) -> k.toLowerCase().replace(/ /g, '')
    slug = id.toLowerCase()
    # by default will just return the id, unless it finds a matching slug
    return if mapping[slug] then mapping[slug] else id

  Service.listingIs = (name, listing = Service.listing) ->
    Service.LISTING_MAP[listing.Id] == name

  Service.stubListingPreferences = ->
    opts = null
    if (Service.listingIs('Alchemy'))
      opts = {
        COPUnits: 50
        DTHPUnits: 10
        NRHPUnits: 20
        NRHPDistrict: 8
      }
    if (Service.listingIs('480 Potrero'))
      opts = {
        COPUnits: 11
        DTHPUnits: 2
        NRHPUnits: 4
        NRHPDistrict: 10
      }
    if (Service.listingIs('21 Clarence'))
      opts = {
        COPUnits: 1
        DTHPUnits: 1
        NRHPUnits: 0
      }
    if (Service.listingIs('168 Hyde'))
      opts = {
        COPUnits: 1
        DTHPUnits: 0
        NRHPUnits: 0
      }
    if (Service.listingIs('Olume'))
      opts = {
        COPUnits: 18
        DTHPUnits: 3
        NRHPUnits: 7
        NRHPDistrict: 6
      }
    if (Service.listingIs('3445 Geary'))
      opts = {
        COPUnits: 1
        DTHPUnits: 0
        NRHPUnits: 0
      }
    if (Service.listingIs('125 Mason'))
      opts = {
        COPUnits: 3
        DTHPUnits: 3
        NRHPUnits: 0
      }
    if (Service.listingIs('Argenta 909'))
      opts = {
        COPUnits: 1
        DTHPUnits: 1
        NRHPUnits: 0
      }
    if (Service.listingIs('Northpoint Vistas'))
      opts = {
        COPUnits: 2
        DTHPUnits: 2
        NRHPUnits: 0
      }
    if (Service.listingIs('280 Brighton'))
      opts = {
        COPUnits: 3
        DTHPUnits: 0
        NRHPUnits: 0
      }
    if (Service.listingIs('30 Dore'))
      opts = {
        COPUnits: 1
        DTHPUnits: 0
        NRHPUnits: 0
      }
    if opts
      Service.stubPreferences(opts)

  Service.stubPreferences = (options) ->
    defaults = [
      {
        preferenceName: 'Certificate of Preference (COP)'
        description: '''
          Households in which one member holds a Certificate of Preference from the former San Francisco
          Redevelopment Agency. COP holders were displaced by Agency action generally during the 1960s and 1970s.
          '''
        unitsAvailable: options.COPUnits
        readMoreUrl: 'http://sfmohcd.org/certificate-preference'
      },
      {
        preferenceName: 'Displaced Tenant Housing Preference (DTHP)'
        description: '''
          Households in which one member holds a Displaced Tenant Housing Preference Certificate.
          DTHP Certificate holders are people who have been evicted through either an Ellis Act Eviction
          or an Owner Move-In Eviction in 2010 or later. Once all units reserved for this preference are filled,
          remaining DTHP holders will receive Live/Work preference, regardless of their current living or working location.
          '''
        unitsAvailable: options.DTHPUnits
        readMoreUrl: 'http://sfmohcd.org/displaced-tenant-housing-preference-program-0'
      },
      {
        preferenceName: 'Neighborhood Resident Housing Preference (NRHP)'
        description: """
          Households that submit acceptable documentation that at least one member lives either within supervisorial
          District #{options.NRHPDistrict} or within a half-mile of the project.
          """
        unitsAvailable: options.NRHPUnits
        readMoreUrl: 'http://sfmohcd.org/neighborhood-resident-housing-preference'
      },
      {
        preferenceName: 'Live or Work in San Francisco Preference'
        description: '''
          Households that submit acceptable documentation that at least one member lives or works in San Francisco.
          In order to claim Work Preference, you or a household member must currently work in San Francisco at least
          75% of your working hours.
          '''
        unitsAvailable: 'Remaining'
        readMoreUrl: 'http://sfmohcd.org/housing-preference-programs'
      }
    ]

    preferences = []
    i = 1
    defaults.forEach (pref) ->
      if pref.unitsAvailable
        pref.order = i++
        preferences.push(pref)

    Service.listing.preferences = preferences

  Service.stubFeatures = (listing) ->
    listing.STUB_Reserved_community_type = 'Senior Community Building'
    listing.STUB_Has_waitlist = true
    listing.STUB_Priorities = ['People with Developmental Disabilities', 'Veterans', 'Seniors']
    listing.STUB_AMI_Levels = [
      {year: '2016', chartType: 'Non-HERA', percent: '50'}
      {year: '2016', chartType: 'HCD/TCAC', percent: '50'}
      {year: '2016', chartType: 'Non-HERA', percent: '60'}
    ]
    return listing

  Service.stubUnitFeatures = (units) ->
    units.forEach (unit) ->
      unit.STUB_AMI_chartType = 'Non-HERA'
      if unit.Id == 'a0b6C000000DDo5QAG'
        unit.STUB_AMI_percent = '50'
        unit.STUB_Status = 'Occupied'
      else if unit.Id == 'a0b6C000000DKyaQAG'
        unit.STUB_AMI_percent = '60'
        unit.STUB_Status = 'Occupied'
      else if unit.Id == 'a0b6C000000DKyfQAG'
        unit.STUB_AMI_percent = '60'
        unit.STUB_Status = 'Available'
        unit.STUB_Percent_Rent = '30'
        unit.STUB_Reserved_Type = 'Vision impaired'
      else
        unit.STUB_AMI_percent = '60'
        unit.STUB_Status = 'Available'
      unit.STUB_AMI_year = '2016'
    units

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingService.$inject = ['$http', '$localStorage', '$modal', '$q', '$state', '$translate']

angular
  .module('dahlia.services')
  .service('ListingService', ListingService)
