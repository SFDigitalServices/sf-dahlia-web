############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingPreferenceService = ($http, ListingConstantsService, ListingIdentityService) ->
  Service = {}
  Service.loading = {}
  Service.error = {}
  Service.preferenceMap = ListingConstantsService.preferenceMap

  Service.hasPreference = (preference, listing) ->
    preferenceNames = _.map(listing.preferences, (pref) -> pref.preferenceName)
    # look up the full name of the preference (i.e. "workInSf" -> "Live/Work Preference")
    _.includes(preferenceNames, Service.preferenceMap[preference])


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

  Service.isRTRPreference = (preferenceName) ->
    # Determine if preference is one of the right to return preferences
    return _.includes(ListingConstantsService.rightToReturnPreferences, preferenceName)

  Service.hasRTRPreference = (listing) ->
    # Determine if the listing has a right to return preference
    hasRTRMap = _.map(ListingConstantsService.rightToReturnPreferences, (pref) -> Service.hasPreference(pref, listing))
    _.some(hasRTRMap)

  Service.getRTRPreferenceKey = (listing) ->
    # If there's a right to return preference, return the key for it.
    # if not, return null
    for prefKey in ListingConstantsService.rightToReturnPreferences
      return prefKey if Service.hasPreference(prefKey, listing)

  # TODO: Replace with `requiresProof` listing preference setting (#154784101)
  Service.hardcodeCustomProofPrefs = []

  Service._extractCustomPreferences = (listing) ->
    customPreferences = _.filter listing.preferences, (listingPref) ->
      !_.invert(Service.preferenceMap)[listingPref.preferenceName]
    customProofPreferences = _.remove customPreferences, (customPref) ->
      _.includes(Service.hardcodeCustomProofPrefs, customPref.preferenceName)

    # custom preferences related to Veterans should not be seen by applicants
    _.remove(customPreferences, (pref) -> _.includes(pref.preferenceName?.toLowerCase(), "veteran"))

    listing.customPreferences = _.sortBy customPreferences, (pref) -> pref.order
    listing.customProofPreferences = _.sortBy customProofPreferences, (pref) -> pref.order

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingPreferenceService.$inject = ['$http', 'ListingConstantsService', 'ListingIdentityService']

angular
  .module('dahlia.services')
  .service('ListingPreferenceService', ListingPreferenceService)
