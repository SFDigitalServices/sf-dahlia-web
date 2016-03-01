############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingService = ($http, $localStorage, $modal) ->
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
  Service.lotteryPreferences = []

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

  Service.hasEligibilityFilters = ->
    !! (Service.eligibility_filters.income_total &&
        Service.eligibility_filters.income_timeframe &&
        Service.eligibility_filters.household_size)

  Service.eligibilityYearlyIncome = ->
    if Service.eligibility_filters.income_timeframe == 'per_month'
      parseFloat(Service.eligibility_filters.income_total) * 12
    else
      parseFloat(Service.eligibility_filters.income_total)

  Service.eligibilityIncomeTimeframe = ->
    # just return 'month' or 'year' and get rid of the 'per_'
    if Service.eligibility_filters.income_timeframe
      Service.eligibility_filters.income_timeframe.split('per_')[1]
    else
      ''

  Service.eligibilityIncomeTotal = ->
    parseFloat(Service.eligibility_filters.income_total)

  Service.eligibilityHouseholdSize = ->
    Service.eligibility_filters.household_size

  Service.eligibilityChildrenUnder6 = ->
    Service.eligibility_filters.children_under_6

  Service.occupancyMinMax = (listing) ->
    minMax = [1,1]
    if listing.unitSummary
      listing.unitSummary.forEach (unit_summary) ->
        minMax = [Math.min(minMax[0], unit_summary.minOccupancy), Math.max(minMax[1], unit_summary.maxOccupancy)]
    return minMax

  Service.maxIncomeLevelsFor = (listing, ami) ->
    occupancyMinMax = Service.occupancyMinMax(listing)
    incomeLevels = []
    ami.forEach (amiLevel) ->
      occupancy = parseInt(amiLevel.numOfHousehold)
      # only grab the incomeLevels that fit within our listing's occupancyMinMax
      if occupancy >= occupancyMinMax[0] && occupancy <= occupancyMinMax[1]
        incomeLevels.push({
          occupancy: occupancy,
          yearly: parseFloat(amiLevel.amount),
          monthly: parseFloat(amiLevel.amount) / 12.0
        })
    return incomeLevels

  Service.openLotteryResultsModal = ->
    modalInstance = $modal.open({
      templateUrl: 'listings/templates/listing/_lottery_modal.html',
      controller: 'ModalInstanceController'
    })

  Service.formattedAddress = (listing, type='Building') ->
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
      State = listing["#{type}_State"] + ', '
    else
      State = ''
    if type == 'Application'
      zip_code_field == "#{type}_Postal_Code"
    else
      zip_code_field = "#{type}_Zip_Code"
    if listing[zip_code_field] != undefined
      Zip_Code = listing[zip_code_field]
    else
      Zip_Code = ''
    "#{Street_Address}#{City} " +
    "#{State}#{Zip_Code}"

  ###################################### Salesforce API Calls ###################################

  Service.getListing = (_id) ->
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
    $http.post("/api/v1/listings-eligibility.json", params).success((data, status, headers, config) ->
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
      if Service.listingIsOpen(listing.Application_Due_Date)
        # All Open Listings Array
        Service.openListings.push(listing)
        if listing.Does_Match
          Service.openMatchListings.push(listing)
        else
          Service.openNotMatchListings.push(listing)
      else if !Service.listingIsOpen(listing.Application_Due_Date)
        if listing.Lottery_Results
          Service.lotteryResultsListings.push(listing)
        else
          Service.closedListings.push(listing)

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
  Service.listingIsOpen = (due_date) ->
    now = new Date()
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    due_date = new Date(due_date)
    if due_date > today
      true
    else
      false

  Service.getListingAMI = ->
    angular.copy([], Service.AMI)
    percent = if (Service.listing && Service.listing.AMI_Percentage) then Service.listing.AMI_Percentage else 100
    $http.get("/api/v1/ami.json?percent=#{percent}").success((data, status, headers, config) ->
      if data && data.ami
        angular.copy(data.ami, Service.AMI)
        angular.copy(Service.maxIncomeLevelsFor(Service.listing, Service.AMI), Service.maxIncomeLevels)
    ).error( (data, status, headers, config) ->
      return
    )

  Service.getLotteryPreferences = ->
    angular.copy([], Service.lotteryPreferences)
    $http.get('/api/v1/lottery-preferences.json').success((data, status, headers, config) ->
      if data && data.lottery_preferences
        angular.copy(data.lottery_preferences, Service.lotteryPreferences)
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

  Service.getLotteryResults = ->
    $http.get("/api/v1/listings/#{Service.listing.Id}/lottery_results").success((data, status, headers, config) ->
      if data && data.lottery_results
        Service.listing.Lottery_Members = data.lottery_results
    ).error( (data, status, headers, config) ->
      return
    )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingService.$inject = ['$http', '$localStorage', '$modal']

angular
  .module('dahlia.services')
  .service('ListingService', ListingService)
