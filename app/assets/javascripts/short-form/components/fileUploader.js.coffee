angular.module('dahlia.components')
.component 'fileUploader',
  bindings:
    buttonLabel: '@'
    document: '<'
    fileLabel: '@'
    fileType: '@'
    required: '<'
  templateUrl: 'short-form/components/file-uploader.html'

  controller:
    ['ShortFormApplicationService', 'FileUploadService', 'SharedService'
    (ShortFormApplicationService, FileUploadService, SharedService) ->
      ctrl = @
      fileInputName = "#{ctrl.fileType}File"
      ctrl.inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      ctrl.listing = ShortFormApplicationService.listing

      ctrl.hasFile = ->
        !_.isEmpty(ctrl.document.file) && !ctrl.document.loading

      ctrl.validateFile = (file) ->
        if file
          if file.name.length > FileUploadService.maxFileNameLength
            ctrl.document.error = 'ERROR.FILE_NAME_TOO_LONG'
          else
            if file.size > FileUploadService.maxFileSizeBytes
              ctrl.document.error = 'ERROR.FILE_UPLOAD'
            else
              true
        else
          ctrl.document.error = 'ERROR.FILE_MISSING'

      ctrl.uploadFile = (file) ->
        ctrl.document.proofOption = ctrl.fileType
        opts = {document: ctrl.document}
        FileUploadService.uploadProof(file, ctrl.listing, opts)

      ctrl.deleteFile = ->
        opts =
          document: ctrl.document,
          document_type: ctrl.fileType
        FileUploadService.deleteFile(ctrl.listing, opts)

      ctrl.assetPaths = SharedService.assetPaths

      return ctrl
  ]
