RentBurdenFileService = ($http, $q, uuid, ListingDataService, ListingPreferenceService) ->
  Service = {}
  # these are to be overridden
  Service.preferences = {}
  Service.session_uid = -> null

  Service.uploadedRentBurdenRentFiles = (address) ->
    addressFiles = Service.preferences.documents.rentBurden[address]
    if !_.isEmpty(addressFiles)
      rentFiles = addressFiles.rent
      _.filter(rentFiles, (file) -> !_.isEmpty(file.file))
    else
      []

  Service.hasRentBurdenFiles = (address = null) ->
    hasFiles = false
    if address
      docs = Service.preferences.documents.rentBurden[address]
      return false unless docs
      hasFiles = !!(docs.lease.file || _.some(_.map(docs.rent, 'file')))
    else
      _.map Service.preferences.documents.rentBurden, (doc, address) ->
        hasFiles = hasFiles || Service.hasRentBurdenFiles(address)
    return hasFiles

  Service.clearRentBurdenFile = (opts, preferences = null) ->
    Service.preferences = preferences if preferences
    rentBurdenDocs = Service.preferences.documents.rentBurden[opts.address]
    return unless rentBurdenDocs
    if opts.rentBurdenType == 'lease'
      angular.copy({}, rentBurdenDocs.lease)
    else
      # remove pref file at opts.index
      delete rentBurdenDocs.rent[opts.index]

  Service.clearRentBurdenFiles = (address = null) ->
    if address
      rentBurdenDocs = Service.preferences.documents.rentBurden[address]
      angular.copy({}, rentBurdenDocs.lease)
      angular.copy({}, rentBurdenDocs.rent)
    else
      _.each Service.preferences.documents.rentBurden, (docs, address) ->
        rentBurdenDocs = Service.preferences.documents.rentBurden[address]
        angular.copy({}, rentBurdenDocs.lease)
        angular.copy({}, rentBurdenDocs.rent)

  Service.deleteRentBurdenPreferenceFiles = (listing_id, address = null) ->
    pref = ListingPreferenceService.getPreference('rentBurden', ListingDataService.listing)
    return unless pref
    pref_id = pref.listingPreferenceID
    unless Service.hasRentBurdenFiles(address)
      return $q.resolve()
    params =
      uploaded_file:
        session_uid: Service.session_uid()
        listing_preference_id: pref_id
        listing_id: listing_id
    # if no address provided, we are deleting *all* rentBurdenFiles for this user/listing
    params.uploaded_file.address = address if address

    $http.delete('/api/v1/short-form/proof', {
      data: params,
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((data, status, headers, config) ->
      # clear out fileObj
      Service.clearRentBurdenFiles(address)
    ).catch( (data, status, headers, config) ->
      return
    )


  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

RentBurdenFileService.$inject = [
  '$http', '$q', 'uuid', 'ListingDataService', 'ListingPreferenceService'
]

angular
  .module('dahlia.services')
  .service('RentBurdenFileService', RentBurdenFileService)
