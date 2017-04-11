FileUploadService = ($http, Upload, uuid) ->
  Service = {}
  # these are to be overridden
  Service.preferences = {}
  Service.session_uid = -> null

  Service.hasPreferenceFile = (fileType) ->
    Service.preferences[fileType] && !Service.preferenceFileIsLoading(fileType)

  Service.preferenceFileError = (fileType, rentBurdenOpts) ->
    !! Service.preferences["#{fileType}_error"]

  Service.preferenceFileIsLoading = (fileType, rentBurdenOpts) ->
    !! Service.preferences["#{fileType}_loading"]

  Service.deletePreferenceFile = (prefType, listing_id, opts = {}) ->
    params =
      uploaded_file:
        session_uid: Service.session_uid()
        listing_id: listing_id
        preference: prefType

    if opts.rentBurdenType
      params.uploaded_file.rent_burden_type = opts.rentBurdenType
      params.uploaded_file.address = opts.address
      fileObj = Service.rentBurdenFile(opts)
    else
      fileType = "#{prefType}_proof_file"
      fileObj = Service.preferences[fileType]
    return if _.isEmpty(fileObj)

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

  # Rent Burden specific functions
  Service.hasRentBurdenFile = (opts) ->
    Service.rentBurdenFile(opts).file && !Service.rentBurdenFileIsLoading(opts)

  Service.rentBurdenFileError = (opts) ->
    Service.rentBurdenFile(opts).error

  Service.rentBurdenFileIsLoading = (opts) ->
    Service.rentBurdenFile(opts).loading

  Service.clearRentBurdenFile = (opts) ->
    proofFiles = Service.preferences.rentBurden_proof[opts.address]
    return unless proofFiles
    if opts.rentBurdenType == 'lease'
      angular.copy({}, proofFiles.lease_file)
    else
      # remove pref file at opts.index
      angular.copy({}, proofFiles.rent_files[opts.index])

  Service.clearRentBurdenFiles = (address) ->
    emptyPrefs = {
      lease_file: {}
      rent_files: []
    }
    angular.copy(emptyPrefs, Service.preferences.rentBurden_proof[address])

  Service.rentBurdenFile = (opts) ->
    proofFiles = Service.preferences.rentBurden_proof[opts.address]
    return {} unless proofFiles
    if opts.rentBurdenType == 'lease'
      proofFiles.lease_file ?= {}
    else
      proofFiles.rent_files[opts.index] ?= {}

  Service.deleteRentBurdenPreferenceFiles = (listing_id, address) ->
    params =
      uploaded_file:
        session_uid: Service.session_uid()
        listing_id: listing_id
        address: address

    $http.delete('/api/v1/short-form/rent-burden-proof', {
      data: params,
      headers: {
        'Content-Type': 'application/json'
      },
    }).success((data, status, headers, config) ->
      # clear out fileObj
      Service.clearRentBurdenFiles(address)
    ).error( (data, status, headers, config) ->
      return
    )


  Service.uploadRentBurdenProof = (file, opts = {}) ->
    ###
    opts = {
      address
      rentBurdenType ("lease" or "rent")
      docType ("Copy of Lease")
      index
    }
    ###

    proofFileObject = Service.rentBurdenFile(opts)
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
