FileUploadService = ($http, Upload, uuid) ->
  Service = {}
  # these are to be overridden
  Service.preferences = {}
  Service.session_uid = -> null

  Service.hasPreferenceFile = (fileType) ->
    Service.preferences[fileType] && !Service.preferenceFileIsLoading(fileType)

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

  Service.preferenceFileError = (fileType) ->
    !! Service.preferences["#{fileType}_error"]

  Service.preferenceFileIsLoading = (fileType) ->
    !! Service.preferences["#{fileType}_loading"]

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
