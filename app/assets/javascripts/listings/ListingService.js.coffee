############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingService = ($http, $localStorage, $modal, $q, $state) ->
  Service = {}
  Service.listing = {}
  Service.listings = []
  Service.openListings = []
  Service.openMatchListings = []
  Service.openNotMatchListings = []
  Service.closedListings = []
  Service.lotteryResultsListings = []
  # these get loaded after the listing is loaded
  Service.AMI = []
  Service.maxIncomeLevels = []

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
      max = _.max(_.map(listing.unitSummary, 'maxOccupancy'))
      minMax = [min, max]
    return minMax

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
          monthly: parseFloat(amiLevel.amount) / 12.0
        })
    return incomeLevels

  Service.openLotteryResultsModal = ->
    modalInstance = $modal.open({
      templateUrl: 'listings/templates/listing/_lottery_modal.html',
      controller: 'ModalInstanceController',
      windowClass: 'modal-small'
    })

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

  ###################################### Salesforce API Calls ###################################

  Service.getListing = (_id) ->
    _id = Service.mapSlugToId(_id)
    if Service.listing && Service.listing.Id == _id
      # return a resolved promise if we already have the listing
      return $q.when(Service.listing)
    angular.copy({}, Service.listing)
    $http.get("/api/v1/listings/#{_id}.json").success((data, status, headers, config) ->
      angular.copy((if data and data.listing then data.listing else {}), Service.listing)
    ).error( (data, status, headers, config) ->
      return
    )

  Service.getListings = () ->
    # check for default state
    if Service.hasEligibilityFilters()
      return Service.getListingsWithEligibility()
    $http.get("/api/v1/listings.json").success((data, status, headers, config) ->
      listings = if data and data.listings then data.listings else []
      Service.groupListings(listings)
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
    angular.copy([], Service.AMI)
    percent = if (Service.listing && Service.listing.AMI_Percentage) then Service.listing.AMI_Percentage else 100
    $http.get("/api/v1/listings/ami.json?percent=#{percent}").success((data, status, headers, config) ->
      if data && data.ami
        angular.copy(data.ami, Service.AMI)
        angular.copy(Service.maxIncomeLevelsFor(Service.listing, Service.AMI), Service.maxIncomeLevels)
    ).error( (data, status, headers, config) ->
      return
    )

  Service.getListingUnits = ->
    # angular.copy([], Service.listing.Units)
    $http.get("/api/v1/listings/#{Service.listing.Id}/units").success((data, status, headers, config) ->
      if data && data.units
        Service.listing.Units = data.units
    ).error( (data, status, headers, config) ->
      return
    )

  Service.getLotteryBuckets = ->
    $http.get("/api/v1/listings/#{Service.listing.Id}/lottery_buckets").success((data, status, headers, config) ->
      if data && data.lottery_buckets.bucketResults
        Service.listing.Lottery_Buckets = data.lottery_buckets
    ).error( (data, status, headers, config) ->
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
  }

  Service.mapSlugToId = (id) ->
    # strip spaces and lowercase the listing names e.g. "Argenta 909" => "argenta909"
    mapping = _.mapKeys _.invert(Service.LISTING_MAP), (v, k) -> k.toLowerCase().replace(/ /g, '')
    slug = id.toLowerCase()
    # by default will just return the id, unless it finds a matching slug
    return if mapping[slug] then mapping[slug] else id

  Service.listingIs = (listing, name) ->
    Service.LISTING_MAP[listing.Id] == name

  Service.listingIsAny = (listing, names) ->
    _.includes(names, Service.LISTING_MAP[listing.Id])


  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingService.$inject = ['$http', '$localStorage', '$modal', '$q', '$state']

angular
  .module('dahlia.services')
  .service('ListingService', ListingService)
