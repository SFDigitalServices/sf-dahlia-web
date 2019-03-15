angular.module('dahlia.components')
.component 'fileUploader',
  bindings:
    application: '<'
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
      @fileInputName = "#{@fileType}File"
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @listing = ShortFormApplicationService.listing

      @hasFile = =>
        !_.isEmpty(@document.file) && !@document.loading

      @validateFile = ($file) ->
        if $file
          if $file.name.length > 80
            @document.error = 'ERROR.FILE_NAME_TOO_LONG'
          else
            if $file.size > 5 * 1000 * 1000 # 5MB
              @document.error = 'ERROR.FILE_UPLOAD'
            else
              true
        else
          @document.error = 'ERROR.FILE_MISSING'

      @uploadFile = ($file) =>
        @document.proofOption = @fileType
        opts = {
          document: @document
        }
        FileUploadService.uploadProof($file, @listing, opts)

      @deleteFile = =>
        opts = {
          document: @document,
          document_type: @fileType
        }
        FileUploadService.deleteFile(@listing, opts)

      @assetPaths = SharedService.assetPaths

      return ctrl
  ]
