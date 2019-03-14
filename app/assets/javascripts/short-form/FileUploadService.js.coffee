FileUploadService = ($http, $q, Upload, uuid, ListingDataService, ListingPreferenceService) ->
  Service = {}
  # these are to be overridden
  Service.preferences = {}
  Service.session_uid = -> null

  Service.deleteFile = (pref_type, listing_id, opts = {}) ->
    if pref_type
      pref = ListingPreferenceService.getPreference(pref_type, ListingDataService.listing)
      # might be calling deleteFile on a preference that this listing doesn't have
      pref_id = if pref then pref.listingPreferenceID else pref_type
      return $q.reject() unless ListingPreferenceService.getPreferenceById(pref_id, ListingDataService.listing)

      proofDocument = Service._proofDocument(pref_type, opts)
    else
      proofDocument = opts.document

    params = Service._uploadedFileParams(listing_id, pref_id, opts, proofDocument)

    if _.isEmpty(proofDocument) || _.isEmpty(proofDocument.file)
      proofDocument.proofOption = null if proofDocument
      return $q.resolve()

    $http.delete('/api/v1/short-form/proof', {
      data: params,
      headers: {
        'Content-Type': 'application/json'
      },
    }).success((data, status, headers, config) ->
      # clear out fileObj
      if opts.rentBurdenType
        Service.clearRentBurdenFile(opts)
      else
        proofDocument.file = null
        proofDocument.proofOption = null
    ).error( (data, status, headers, config) ->
      return
    )

  Service.uploadProof = (file, pref_type, listing_id, opts = {}) ->
    if opts.proofDocument
      proofDocument = opts.proofDocument
    else
      preference = ListingPreferenceService.getPreference(pref_type, ListingDataService.listing)
      pref_id = if preference then preference.listingPreferenceID else pref_type
      return $q.reject() unless ListingPreferenceService.getPreferenceById(pref_id, ListingDataService.listing)
      proofDocument = Service._proofDocument(pref_type, opts)

    if (!file)
      return $q.reject()

    uploadedFileParams = Service._uploadedFileParams(listing_id, pref_id, opts, proofDocument).uploaded_file
    proofDocument.loading = true
    Service._processProofFile(file, proofDocument, uploadedFileParams)

  Service._uploadedFileParams = (listing_id, pref_id, opts, document) ->
    params = uploaded_file:
      session_uid: Service.session_uid()
      listing_id: listing_id
      listing_preference_id: pref_id
      document_type: document.proofOption

    if opts.rentBurdenType
      params.uploaded_file.address = opts.address
      params.uploaded_file.rent_burden_type = opts.rentBurdenType
      params.uploaded_file.rent_burden_index = opts.index

    params

  Service._proofDocument = (prefType, opts) ->
    if opts.rentBurdenType
      rentBurdenDocs = Service.preferences.documents.rentBurden[opts.address]
      return {} unless rentBurdenDocs
      if opts.rentBurdenType == 'lease'
        rentBurdenDocs.lease
      else
        rentBurdenDocs.rent[opts.index]
    else
      Service.preferences.documents[prefType] ?= {}

  Service._processProofFile = (file, proofDocument, uploadedFileParams) ->
    if file.size > 2 * 1000 * 1000 # 2MB
      options =
        width: 2112,
        height: 2112,
        quality: 0.8
      Upload.resize(file, options).then( (resizedFile) ->
        Service._uploadProofFile(resizedFile, proofDocument, uploadedFileParams)
      )
    else
      Service._uploadProofFile(file, proofDocument, uploadedFileParams)

  Service._uploadProofFile = (file, proofDocument, uploadedFileParams) ->
    if file.size > 5 * 1000 * 1000 # 5MB
      proofDocument.file = null
      proofDocument.loading = false
      proofDocument.error = 'ERROR.FILE_UPLOAD'
    else
      uploadedFileParams.file = file
      Upload.upload(
        url: '/api/v1/short-form/proof'
        method: 'POST'
        data:
          uploaded_file: uploadedFileParams
      ).then( ((resp) ->
        proofDocument.loading = false
        proofDocument.error = false
        proofDocument.file = resp.data
      ), ((resp) ->
        # error handler
        proofDocument.file = null
        proofDocument.loading = false
        proofDocument.error = 'ERROR.FILE_UPLOAD_FAILED'
      ))

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

FileUploadService.$inject = [
  '$http', '$q', 'Upload', 'uuid', 'ListingDataService', 'ListingPreferenceService'
]

angular
  .module('dahlia.services')
  .service('FileUploadService', FileUploadService)
