FileUploadService = ($http, $q, Upload, uuid, ListingPreferenceService, RentBurdenFileService, ShortFormHelperService) ->
  Service = {}
  Service.maxFileNameLength = 80
  Service.maxFileSizeBytes = 2.5e7 # 25MB
  # these are to be overridden
  Service.preferences = {}
  Service.session_uid = -> null

  Service.deleteFile = (listing, opts = {}) ->
    proofDocument = Service._proofDocument(listing, opts)
    return $q.reject() unless proofDocument
    if _.isEmpty(proofDocument.file)
      proofDocument.proofOption = null
      return $q.resolve()

    params = Service._uploadedFileParams(listing.Id, opts, proofDocument)
    $http.delete('/api/v1/short-form/proof', {
      data: params,
      headers: {
        'Content-Type': 'application/json'
      },
    }).success((data, status, headers, config) ->
      # Clear out the file
      if opts.rentBurdenType
        RentBurdenFileService.clearRentBurdenFile(opts, Service.preferences)
      else
        proofDocument.file = null
        proofDocument.proofOption = null
    ).error( (data, status, headers, config) ->
      return
    )

  Service.uploadProof = (file, listing, opts = {}) ->
    return $q.reject() if (!file)

    proofDocument = Service._proofDocument(listing, opts)
    return $q.reject() unless proofDocument

    uploadedFileParams = Service._uploadedFileParams(listing.Id, opts, proofDocument).uploaded_file
    proofDocument.loading = true
    Service._processProofFile(file, proofDocument, uploadedFileParams)

  Service._uploadedFileParams = (listingId, opts, document) ->
    params = uploaded_file:
      session_uid: Service.session_uid()
      listing_id: listingId
      listing_preference_id: opts.prefId
      document_type: document.proofOption

    if opts.rentBurdenType
      params.uploaded_file.address = opts.address
      params.uploaded_file.rent_burden_type = opts.rentBurdenType
      params.uploaded_file.rent_burden_index = opts.index

    params

  Service._proofDocument = (listing, opts) ->
    return opts.document if opts.document

    pref = ListingPreferenceService.getPreference(opts.prefType, listing)
    # might be calling deleteFile on a preference that this listing doesn't have
    # passing prefId to opts, as it will be needed later
    opts.prefId = if pref then pref.listingPreferenceID else opts.prefType
    return null unless ListingPreferenceService.getPreferenceById(opts.prefId, listing)

    if opts.rentBurdenType
      rentBurdenDocs = Service.preferences.documents.rentBurden[opts.address]
      return {} unless rentBurdenDocs
      if opts.rentBurdenType == 'lease'
        rentBurdenDocs.lease
      else
        rentBurdenDocs.rent[opts.index]
    else
      Service.preferences.documents[opts.prefType] ?= {}

  Service._processProofFile = (file, proofDocument, uploadedFileParams) ->
    file_limit_for_resize = 2 * 1000 * 1000 # 2MB
    if file.size > file_limit_for_resize && file.type != 'image/heic'
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
    if file.size > Service.maxFileSizeBytes
      proofDocument.file = null
      proofDocument.loading = false
      proofDocument.error = ShortFormHelperService.flagForI18n('error.file_upload')
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
        proofDocument.error = ShortFormHelperService.flagForI18n('error.file_upload_failed')
      ))

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

FileUploadService.$inject = [
  '$http', '$q', 'Upload', 'uuid', 'ListingPreferenceService', 'RentBurdenFileService', 'ShortFormHelperService'
]

angular
  .module('dahlia.services')
  .service('FileUploadService', FileUploadService)
