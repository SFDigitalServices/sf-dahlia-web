FileUploadService = ($http, Upload, uuid) ->
  Service = {}
  # these are to be overridden
  Service.preferences = {}
  Service.session_uid = -> null

  Service.hasPreferenceFile = (fileType, rentBurdenOpts) ->
    Service.preferences[fileType] && !Service.preferenceFileIsLoading(fileType)

  Service.preferenceFileError = (fileType, rentBurdenOpts) ->
    !! Service.preferences["#{fileType}_error"]

  Service.preferenceFileIsLoading = (fileType, rentBurdenOpts) ->
    !! Service.preferences["#{fileType}_loading"]


  # Rent Burden specific functions
  Service.hasRentBurdenFile = (opts) ->
    Service.rentBurdenFile(opts).file && !Service.rentBurdenFileIsLoading(opts)

  Service.rentBurdenFileError = (opts) ->
    Service.rentBurdenFile(opts).error

  Service.rentBurdenFileIsLoading = (opts) ->
    Service.rentBurdenFile(opts).loading

  Service.rentBurdenFile = (opts) ->
    if opts.rentBurdenType == 'lease'
      Service.preferences.rentBurden_proof[opts.address].lease_file

  #########

  Service.deletePreferenceFile = (prefType, listing_id) ->
    fileType = "#{prefType}_proof_file"
    return if _.isEmpty(Service.preferences[fileType])
    params =
      uploaded_file:
        session_uid: Service.session_uid()
        listing_id: listing_id
        preference: prefType
    $http.delete('/api/v1/short-form/proof', {
      data: params,
      headers: {
        'Content-Type': 'application/json'
      },
    }).success((data, status, headers, config) ->
      Service.preferences[fileType] = null
    ).error( (data, status, headers, config) ->
      return
    )

  Service.uploadProof = (file, prefType, docType, listing_id) ->
    fileType = "#{prefType}_proof_file"
    if (!file)
      Service.preferences["#{fileType}_error"] = true
      return
    Service.preferences["#{fileType}_loading"] = true
    Upload.upload(
      url: '/api/v1/short-form/proof'
      method: 'POST'
      data:
        uploaded_file:
          file: file
          session_uid: Service.session_uid()
          listing_id: listing_id
          document_type: docType
          preference: prefType
    ).then( ((resp) ->
      Service.preferences["#{fileType}_loading"] = false
      Service.preferences["#{fileType}_error"] = false
      Service.preferences["#{fileType}"] = resp.data
    ), ((resp) ->
      # error handler
      Service.preferences["#{fileType}_loading"] = false
      Service.preferences["#{fileType}_error"] = true
    ))

  Service.uploadRentBurdenProof = (file, opts = {}) ->
    ###
    opts = {
      address
      rentBurdenType ("lease" or "rent")
      docType ("Copy of Lease")
      index
    }
    ###

    # grab files for this particular address
    proofFiles = Service.preferences.rentBurden_proof[opts.address]
    if opts.rentBurdenType == 'lease'
      proofFileObject = proofFiles.lease_file
    else
      proofFileObject = proofFiles.rent_files[opts.index]
    if (!file)
      proofFileObject.error = true
      return

    proofFileObject.loading = true
    Upload.upload(
      url: '/api/v1/short-form/proof'
      method: 'POST'
      data:
        uploaded_file:
          file: file
          session_uid: Service.session_uid()
          listing_id: opts.listing_id
          document_type: opts.docType
          preference: 'rentBurden'
          address: opts.address
          rent_burden_type: opts.rentBurdenType
    ).then( ((resp) ->
      proofFileObject.loading = false
      proofFileObject.error = false
      proofFileObject.file = resp.data
    ), ((resp) ->
      # error handler
      proofFileObject.loading = false
      proofFileObject.error = true
    ))

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

FileUploadService.$inject = [
  '$http', 'Upload', 'uuid'
]

angular
  .module('dahlia.services')
  .service('FileUploadService', FileUploadService)
