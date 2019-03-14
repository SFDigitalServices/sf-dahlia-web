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
    ['ShortFormApplicationService', 'FileUploadService', 'SharedService', '$translate'
    (ShortFormApplicationService, FileUploadService, SharedService, $translate) ->
      ctrl = @
      @fileInputName = "#{@fileType}File"
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @listingId = ShortFormApplicationService.listing.Id

      @hasFile = =>
        !_.isEmpty(@document.file) && !@document.loading

      @validateFileNameLength = ($file) ->
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
          proofDocument: @document
        }
        FileUploadService.uploadProof($file, null, @listingId, opts)

      @deleteFile = =>
        opts = {
          document: @document,
          document_type: @fileType
        }
        FileUploadService.deleteFile(null, @listingId, opts)

      @assetPaths = SharedService.assetPaths

      return ctrl
  ]
