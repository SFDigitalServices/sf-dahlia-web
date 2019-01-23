############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingPreferencesService = (ListingConstantsService, ListingHelperService, $http) ->
  Service = {}
  Service.loading = {}
  Service.error = {}
  Service.preferenceMap = ListingConstantsService.preferenceMap

  Service.hasPreference = (preference, listing) ->
    preferenceNames = _.map(listing.preferences, (pref) -> pref.preferenceName)
    # look up the full name of the preference (i.e. "workInSf" -> "Live/Work Preference")
    preferenceName = Service.preferenceMap[preference]
    return _.includes(preferenceNames, preferenceName)

  Service.getPreference = (preference, listing) ->
    # looks up full preference object via the short name e.g. 'liveInSf'
    preferenceName = Service.preferenceMap[preference]
    _.find(listing.preferences, { preferenceName: preferenceName })

  Service.getPreferenceById = (listingPreferenceID, listing) ->
    _.find(listing.preferences, { listingPreferenceID: listingPreferenceID })

  Service.getListingPreferences = (listing, forceRecache = false) ->
    Service.loading.preferences = true
    # Reset preferences that might already exist
    angular.copy([], listing.preferences)
    Service.error.preferences = false
    Service.stubListingPreferences(listing)
    # if this listing had stubbed preferences then we can abort
    if !_.isEmpty(listing.preferences)
      return $q.when(listing.preferences).then ->
        Service.loading.preferences = false
    ## <--
    httpConfig = { etagCache: true }
    httpConfig.params = { force: true } if forceRecache
    $http.get("/api/v1/listings/#{listing.Id}/preferences", httpConfig)
    .success((data, status, headers, config) ->
      if data && data.preferences
        listing.preferences = data.preferences
        # TODO: -- REMOVE HARDCODED PREFERENCES --
        Service._extractCustomPreferences(listing)
        Service.loading.preferences = false
    ).error( (data, status, headers, config) ->
      Service.loading.preferences = false
      Service.error.preferences = true
    )

  # TODO: Replace with `requiresProof` listing preference setting (#154784101)
  Service.hardcodeCustomProofPrefs = []

  Service._extractCustomPreferences = (listing) ->
    customPreferences = _.filter listing.preferences, (listingPref) ->
      !_.invert(Service.preferenceMap)[listingPref.preferenceName]
    customProofPreferences = _.remove customPreferences, (customPref) ->
      _.includes(Service.hardcodeCustomProofPrefs, customPref.preferenceName)
    listing.customPreferences = _.sortBy customPreferences, (pref) -> pref.order
    listing.customProofPreferences = _.sortBy customProofPreferences, (pref) -> pref.order

  Service.stubListingPreferences = (listing) ->
    opts = null
    if (ListingHelperService.listingIs('Alchemy', listing))
      opts = {
        COPUnits: 50
        DTHPUnits: 10
        NRHPUnits: 20
        NRHPDistrict: 8
      }
    if (ListingHelperService.listingIs('480 Potrero', listing))
      opts = {
        COPUnits: 11
        DTHPUnits: 2
        NRHPUnits: 4
        NRHPDistrict: 10
      }
    if (ListingHelperService.listingIs('21 Clarence', listing))
      opts = {
        COPUnits: 1
        DTHPUnits: 1
        NRHPUnits: 0
      }
    if (ListingHelperService.listingIs('168 Hyde', listing))
      opts = {
        COPUnits: 1
        DTHPUnits: 0
        NRHPUnits: 0
      }
    if (ListingHelperService.listingIs('Olume', listing))
      opts = {
        COPUnits: 18
        DTHPUnits: 3
        NRHPUnits: 7
        NRHPDistrict: 6
      }
    if (ListingHelperService.listingIs('3445 Geary', listing))
      opts = {
        COPUnits: 1
        DTHPUnits: 0
        NRHPUnits: 0
      }
    if (ListingHelperService.listingIs('125 Mason', listing))
      opts = {
        COPUnits: 3
        DTHPUnits: 3
        NRHPUnits: 0
      }
    if (ListingHelperService.listingIs('Argenta 909', listing))
      opts = {
        COPUnits: 1
        DTHPUnits: 1
        NRHPUnits: 0
      }
    if (ListingHelperService.listingIs('Northpoint Vistas', listing))
      opts = {
        COPUnits: 2
        DTHPUnits: 2
        NRHPUnits: 0
      }
    if (ListingHelperService.listingIs('280 Brighton', listing))
      opts = {
        COPUnits: 3
        DTHPUnits: 0
        NRHPUnits: 0
      }
    if (ListingHelperService.listingIs('30 Dore', listing))
      opts = {
        COPUnits: 1
        DTHPUnits: 0
        NRHPUnits: 0
      }
    if opts
      Service.stubPreferences(opts, listing)

  Service.stubPreferences = (options, listing) ->
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

    listing.preferences = preferences

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingPreferencesService.$inject = ['ListingConstantsService', 'ListingHelperService', '$http']

angular
  .module('dahlia.services')
  .service('ListingPreferencesService', ListingPreferencesService)
