FileUploadService = ($http, Upload, uuid, ShortFormApplicationService) ->
  Service = {}
  Service.session_uid = uuid.v4()
  Service.userkey = uuid.v4()
  Service.preferences = ShortFormApplicationService.preferences

  Service.hasPreferenceFile = (fileType) ->
    Service.preferences[fileType] && !Service.preferenceFileIsLoading(fileType)

  Service.deletePreferenceFile = (prefType) ->
    fileType = "#{prefType}_proof_file"
    params =
      uploaded_file:
        session_uid: Service.session_uid
        userkey: Service.userkey
        preference: prefType
    $http.delete('/api/v1/short-form/proof', {
      data: params,
      headers: {
        'Content-Type': 'application/json'
      },
    }).success((data, status, headers, config) ->
      Service.preferences[fileType] = null
      # console.log(data)
    ).error( (data, status, headers, config) ->
      # console.warn('error')
      return
    )

  Service.preferenceFileError = (fileType) ->
    !! Service.preferences["#{fileType}_error"]

  Service.preferenceFileIsLoading = (fileType) ->
    !! Service.preferences["#{fileType}_loading"]

  Service.uploadProof = (file, prefType) ->
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
          session_uid: Service.session_uid
          userkey: Service.userkey
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
  '$http', 'Upload', 'uuid', 'ShortFormApplicationService'
]

angular
  .module('dahlia.services')
  .service('FileUploadService', FileUploadService)
