############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingDataService = (
  $http, $localStorage, $q, $state, $translate, $timeout,
  ExternalTranslateService, ListingConstantsService, ListingEligibilityService, ListingIdentityService,
  ListingLotteryService, ListingPreferenceService, ListingUnitService, SharedService, IncomeCalculatorService) ->
  Service = {}
  MAINTENANCE_LISTINGS = [] unless MAINTENANCE_LISTINGS
  Service.listing = {}
  Service.listings = []
  Service.openListings = []
  Service.openMatchListings = []
  Service.openNotMatchListings = []
  Service.closedListings = []
  Service.lotteryResultsListings = []
  Service.loading = {}
  Service.error = {}
  Service.toggleStates = {}
  Service.listingPaperAppURLs = []
  $localStorage.favorites ?= []
  Service.favorites = $localStorage.favorites
  Service.preferenceMap = ListingConstantsService.preferenceMap

  Service.deferred = $q.defer()

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

  Service.sortByDate = (sessions) ->
    # used for sorting Open_Houses and Information_Sessions
    _.sortBy sessions, (session) ->
      moment("#{session.Date} #{session.Start_Time}", 'YYYY-MM-DD h:mmA')

  ###################################### Salesforce API Calls ###################################

  Service.getListing = (_id, forceRecache = false, retranslate = false) ->
    if Service.listing && Service.listing.Id == _id
      # return a resolved promise if we already have the listing
      return $q.when(Service.listing)
    Service.resetListingData()

    deferred = $q.defer()
    cmsDeferred = $q.defer()
    httpConfig = { etagCache: true }
    httpConfig.params = { force: true } if forceRecache
    $http.get("/api/v1/listings/#{_id}.json", httpConfig)
    .success(
      Service.getListingResponse(deferred, retranslate)
    ).cached(
      Service.getListingResponse(deferred, retranslate)
    ).error( (data, status, headers, config) ->
      deferred.reject(data)
    )
    $http.get("http://127.0.0.1:8000/api/v2/pages/?locale=en", httpConfig)
    .success(
      Service.getCmsResponse(cmsDeferred, _id, retranslate)
    ).cached(
      Service.getCmsResponse(cmsDeferred, _id, retranslate)
    ).error( (data, status, headers, config) ->
      console.log("error")
      cmsDeferred.reject(data)
    )
    return deferred.promise

  # Remove the previous listing and all it's associated data
  Service.resetListingData = () ->
    angular.copy({}, Service.listing)
    angular.copy([], Service.listingPaperAppURLs)
    ListingLotteryService.resetData()
    ListingUnitService.resetData()

  Service.getCmsResponse = (deferred, _id, retranslate = false) ->
    (data, status, headers, config, itemCache) ->
      # itemCache.set(data) unless status == 'cached'
      console.log("incoming id = " + _id)
      deferred.resolve()
      if !data
        return
      for item in data.items
        console.log "matching title = " + item.title if item.title == _id
      # angular.copy(data.listing, Service.listing)
      # # fallback for fixing the layout when a listing is missing an image
      # Service.listing.imageURL ?= 'https://unsplash.it/g/780/438'
      # # create a combined unitSummary
      # unless Service.listing.unitSummary
      #   Service.listing.unitSummary = ListingUnitService.combineUnitSummaries(Service.listing)
      # # On listing and listings pages, we are experiencing an issue where
      # # where the Google translation will try to keep up with digest re-calcs
      # # happening during page load and will get tripped up and fail, leaving
      # # the page untranslated. This quick fix runs the Google Translation
      # # again to cover for a possible earlier failed translate.
      # # TODO: Remove this quick fix for translation issues on listing pages
      # # and replace with a real fix based on actual digest timing.
      # $timeout(ExternalTranslateService.translatePageContent, 0, false) if retranslate
      # Service.toggleStates[Service.listing.Id] ?= {}

  Service.getListingResponse = (deferred, retranslate = false) ->
    (data, status, headers, config, itemCache) ->
      itemCache.set(data) unless status == 'cached'
      deferred.resolve()
      if !data || !data.listing
        return
      angular.copy(data.listing, Service.listing)
      # fallback for fixing the layout when a listing is missing an image
      Service.listing.imageURL ?= 'https://unsplash.it/g/780/438'
      # create a combined unitSummary
      unless Service.listing.unitSummary
        Service.listing.unitSummary = ListingUnitService.combineUnitSummaries(Service.listing)
      # On listing and listings pages, we are experiencing an issue where
      # where the Google translation will try to keep up with digest re-calcs
      # happening during page load and will get tripped up and fail, leaving
      # the page untranslated. This quick fix runs the Google Translation
      # again to cover for a possible earlier failed translate.
      # TODO: Remove this quick fix for translation issues on listing pages
      # and replace with a real fix based on actual digest timing.
      $timeout(ExternalTranslateService.translatePageContent, 0, false) if retranslate
      Service.toggleStates[Service.listing.Id] ?= {}

  Service._resetHTTPRequests = ->
    # cancel any pending http requests and setup a new deferred
    Service.deferred.resolve()
    Service.deferred = $q.defer()

  Service.getListings = (opts = {}) ->
    Service._resetHTTPRequests()

    # check for eligibility options being set in the session
    if opts.clearFilters
      ListingEligibilityService.resetEligibilityFilters()
      IncomeCalculatorService.resetIncomeSources()
    if opts.checkEligibility && ListingEligibilityService.hasEligibilityFilters()
      return Service.getListingsWithEligibility(opts.params)

    $http.get("/api/v1/listings.json", {
      etagCache: true,
      params: opts.params,
      timeout: Service.deferred.promise
    }).success(
      Service.getListingsResponse(Service.deferred, opts.retranslate)
    ).cached(
      Service.getListingsResponse(Service.deferred, opts.retranslate)
    ).error((data, status, headers, config) ->
      Service.deferred.reject(data)
    )
    return Service.deferred.promise

  Service.getListingsResponse = (deferred, retranslate = false) ->
    (data, status, headers, config, itemCache) ->
      itemCache.set(data) unless status == 'cached'
      listings = if data and data.listings then data.listings else []
      listings = Service.cleanListings(listings)
      Service.groupListings(listings)
      # On listing and listings pages, we are experiencing an issue where
      # where the Google translation will try to keep up with digest re-calcs
      # happening during page load and will get tripped up and fail, leaving
      # the page untranslated. This quick fix runs the Google Translation
      # again to cover for a possible earlier failed translate.
      # TODO: Remove this quick fix for translation issues on listing pages
      # and replace with a real fix based on actual digest timing.
      $timeout(ExternalTranslateService.translatePageContent, 0, false) if retranslate
      deferred.resolve()

  Service.getListingsWithEligibility = (params) ->
    # Given houshold attributes, return listings that household is eligible for
    params =
      householdsize: ListingEligibilityService.eligibility_filters.household_size
      incomelevel: ListingEligibilityService.eligibilityYearlyIncome()
      includeChildrenUnder6: ListingEligibilityService.eligibility_filters.include_children_under_6
      childrenUnder6: ListingEligibilityService.eligibility_filters.children_under_6
      listingsType: params.type

    $http.get("/api/v1/listings/eligibility.json?#{SharedService.toQueryString(params)}", {
      etagCache: true,
      timeout: Service.deferred.promise
    }).success(
      Service.getListingsWithEligibilityResponse(Service.deferred)
    ).cached(
      Service.getListingsWithEligibilityResponse(Service.deferred)
    ).error( (data, status, headers, config) ->
      Service.deferred.reject(data)
    )
    return Service.deferred.promise

  Service.getListingsWithEligibilityResponse = (deferred) ->
    (data, status, headers, config, itemCache) ->
      itemCache.set(data) unless status == 'cached'
      listings = (if data and data.listings then data.listings else [])
      listings = Service.cleanListings(listings)
      Service.groupListings(listings)
      deferred.resolve()

  Service.cleanListings = (listings) ->
    _.map listings, (listing) ->
      # fallback for fixing the layout when a listing is missing an image
      listing.imageURL ?= 'https://unsplash.it/g/780/438'
    _.filter listings, (listing) ->
      !_.includes(MAINTENANCE_LISTINGS, listing.Id)

  Service.groupListings = (listings) ->
    openListings = []
    openMatchListings = []
    openNotMatchListings = []
    closedListings = []
    lotteryResultsListings = []

    listings.forEach (listing) ->
      if ListingIdentityService.isOpen(listing)
        # All Open Listings Array
        openListings.push(listing)
        if listing.Does_Match
          openMatchListings.push(listing)
        else
          openNotMatchListings.push(listing)
      else
        if ListingLotteryService.lotteryComplete(listing)
          lotteryResultsListings.push(listing)
        else
          closedListings.push(listing)

    angular.copy(Service.sortListings(openListings, 'openListings'), Service.openListings)
    angular.copy(Service.sortListings(openMatchListings, 'openMatchListings'), Service.openMatchListings)
    angular.copy(Service.sortListings(openNotMatchListings, 'openNotMatchListings'), Service.openNotMatchListings)
    angular.copy(Service.sortListings(closedListings, 'closedListings'), Service.closedListings)
    angular.copy(Service.sortListings(lotteryResultsListings, 'lotteryResultsListings'), Service.lotteryResultsListings)

  Service.sortListings = (listings, type) ->
    # openListing types
    if ['openListings', 'openMatchListings', 'openNotMatchListings'].indexOf(type) > -1
      _.sortBy listings, (i) -> moment(i.Application_Due_Date)
    # closedListing types
    else if ['closedListings', 'lotteryResultsListings'].indexOf(type) > -1
      listings = _.sortBy listings, (i) ->
        # fallback to Application_Due_Date, really only for the special case of First Come First Serve
        moment(i.Lottery_Results_Date || i.Application_Due_Date)
      # lotteryResults get reversed (latest lottery results date first)
      if type == 'lotteryResultsListings' then _.reverse listings else listings

  Service.getListingsByIds = (ids, checkFavorites = false) ->
    Service._resetHTTPRequests()
    angular.copy([], Service.listings)
    params =
      params: {ids: ids.join(',')}
      timeout: Service.deferred.promise
    $http.get("/api/v1/listings.json", params).success((data, status, headers, config) ->
      listings = if data and data.listings then data.listings else []
      Service.deferred.resolve()
      angular.copy(listings, Service.listings)
      Service.checkFavorites() if checkFavorites
    ).error( (data, status, headers, config) ->
      Service.deferred.reject(data)
      return
    )
    return Service.deferred.promise

  Service.isAcceptingOnlineApplications = (listing) ->
    return false if _.isEmpty(listing)
    return false if ListingLotteryService.lotteryComplete(listing)
    return false unless ListingIdentityService.isOpen(listing)
    return listing.Accepting_Online_Applications

  Service.getListingAndCheckIfOpen = (id) ->
    deferred = $q.defer()
    Service.getListing(id).then( ->
      deferred.resolve(Service.listing)
      if _.isEmpty(Service.listing)
        # kick them out unless there's a real listing
        return $state.go('dahlia.redirect-home')
      else if !Service.isAcceptingOnlineApplications(Service.listing)
        # kick them back to the listing
        return $state.go('dahlia.listing', {id: id})
    ).catch( (response) ->
      deferred.reject(response)
    )
    deferred.promise

  Service.priorityTypes = (listing) ->
    Service.collectTypes(listing, 'prioritiesDescriptor')

  Service.collectTypes = (listing, specialType) ->
    _.map listing[specialType], (descriptor) ->
      descriptor.name

  Service.priorityLabel = (priority, modifier) ->
    return priority unless ListingConstantsService.priorityLabelMap[priority]
    return ListingConstantsService.priorityLabelMap[priority][modifier]

  Service.reservedLabel = (listing, type,  modifier) ->
    labelMap =
      "#{ListingConstantsService.RESERVED_TYPES.SENIOR}":
        building: 'Senior Building'
        eligibility: 'Seniors'
        reservedFor: "seniors #{Service.formatSeniorMinimumAge(listing)}"
        reservedForWhoAre: "seniors #{Service.formatSeniorMinimumAge(listing)}"
        unitDescription: "seniors #{Service.formatSeniorMinimumAge(listing)}"
      "#{ListingConstantsService.RESERVED_TYPES.VETERAN}":
        building: 'Veterans Building'
        eligibility: 'Veterans'
        reservedFor: 'veterans'
        reservedForWhoAre: 'veterans'
        unitDescription: 'veterans of the U.S. Armed Forces'
      "#{ListingConstantsService.RESERVED_TYPES.DISABLED}":
        building: 'Developmental Disability Building'
        eligibility: 'People with developmental disabilities'
        reservedFor: 'people with developmental disabilities'
        reservedForWhoAre: 'developmentally disabled'
        unitDescription: 'people with developmental disabilities'
      "#{ListingConstantsService.RESERVED_TYPES.ARTIST}":
        building: 'Artist Loft Building'
        eligibility: 'Artist lofts'
        reservedFor: 'artists to live and work in'
        reservedForWhoAre: 'professional artists'
      "#{ListingConstantsService.RESERVED_TYPES.ACCESSIBLE_ONLY}":
        building: 'Accessible Units Only'
        eligibility: 'Accessible units'
        reservedFor: 'people who need accessibility features'
        # This is only for listings with reserved units, not fully reserved communities
        reservedForWhoAre: ''
      "#{ListingConstantsService.RESERVED_TYPES.HABITAT}":
        building: 'Habitat Greater San Francisco'
        eligibility: ''
        reservedFor: ''
        # This is only for listings with reserved units, not fully reserved communities
        reservedForWhoAre: ''
    return type unless labelMap[type]
    return labelMap[type][modifier]

  Service.formatSeniorMinimumAge = (listing) ->
    if listing.Reserved_community_minimum_age
      "#{listing.Reserved_community_minimum_age}+"
    else
      ''

  # used by My Applications -- when you load an application we also parse the attached listing data
  Service.loadListing = (listing) ->
    return if Service.listing && Service.listing.Id == listing.Id && listing.preferences
    # TODO: won't be needed if we ever consolidate Listing_Lottery_Preferences and /preferences API
    listing.preferences = _.map listing.Listing_Lottery_Preferences, (lotteryPref) ->
      {
        listingPreferenceID: lotteryPref.Id
        preferenceName: lotteryPref.Lottery_Preference.Name
      }
    ListingPreferenceService._extractCustomPreferences(listing)
    angular.copy(listing, Service.listing)

  Service.formattedAddress = (listing, type='Building', display='full') ->
    street = "#{type}_Street_Address"
    zip = "#{type}_Postal_Code"
    if type == 'Leasing_Agent'
      street = "#{type}_Street"
      zip = "#{type}_Zip"
    else if type == 'Building'
      zip = "#{type}_Zip_Code"

    # If Street address is undefined, then return false for display and google map lookup
    if listing[street] == undefined
      return
    # If other fields are undefined, proceed, with special string formatting
    if listing[street] != undefined
      Street_Address = listing[street] + ', '
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
    if listing[zip] != undefined
      Zip_Code = listing[zip]
    else
      Zip_Code = ''

    if display == 'street'
      return "#{Street_Address}"
    else if display == 'city-state-zip'
      return "#{City} #{State}, #{Zip_Code}"
    else
      "#{Street_Address}#{City} #{State}, #{Zip_Code}"

  Service.getListingPaperAppURLs = (listing) ->
    if ListingIdentityService.isSale(listing)
      urls = angular.copy(ListingConstantsService.salePaperAppURLs)
    else
      urls = angular.copy(ListingConstantsService.rentalPaperAppURLs)

    english = _.find(urls, { language: 'English' })
    chinese = _.find(urls, { language: 'Traditional Chinese' })
    spanish = _.find(urls, { language: 'Spanish' })
    tagalog = _.find(urls, { language: 'Tagalog' })

    # replace download URLs if they are customized on the listing
    english.url = listing.Download_URL if listing.Download_URL
    chinese.url = listing.Download_URL_Cantonese if listing.Download_URL_Cantonese
    spanish.url = listing.Download_URL_Spanish if listing.Download_URL_Spanish
    tagalog.url = listing.Download_URL_Tagalog if listing.Download_URL_Tagalog
    angular.copy(urls, Service.listingPaperAppURLs)

  Service.getProjectIdForBoundaryMatching = (listing) ->
    return unless listing
    if ListingPreferenceService.hasPreference('antiDisplacement', listing)
      'ADHP'
    else if ListingPreferenceService.hasPreference('neighborhoodResidence', listing)
      listing.Project_ID
    else
      null

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingDataService.$inject = [
  '$http', '$localStorage', '$q', '$state', '$translate', '$timeout',
  'ExternalTranslateService', 'ListingConstantsService', 'ListingEligibilityService', 'ListingIdentityService',
  'ListingLotteryService', 'ListingPreferenceService', 'ListingUnitService', 'SharedService', 'IncomeCalculatorService'
]

angular
  .module('dahlia.services')
  .service('ListingDataService', ListingDataService)
