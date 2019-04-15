angular.module('dahlia.components')
.component 'preferenceProofUploader',
  bindings:
    application: '<'
    preference: '@'
    # can get passed through to hardcode a proofType
    proofType: '@'
    proofOptionLabel: '@'
    proofOptions: '<'
    proofDocument: '<'
    buttonLabel: '@'
    afterUpload: '&'
    afterDelete: '&'
    # for rentBurden
    address: '<'
    rentBurdenType: '@'
    uploaded: '<'
  templateUrl: 'short-form/components/preference-proof-uploader.html'

  controller:
    ['ShortFormApplicationService', 'FileUploadService', 'SharedService', 'ShortFormHelperService', '$translate'
    (ShortFormApplicationService, FileUploadService, SharedService, ShortFormHelperService, $translate) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @listing = ShortFormApplicationService.listing
      @buttonLabel ?= $translate.instant('LABEL.UPLOAD_PROOF_OF_PREFERENCE') unless @buttonLabel

      @$onChanges = =>
        if @rentBurdenType
          @selectorName = "#{@preference}_#{@rentBurdenType}Document"
          @fileInputName = "#{@preference}_#{@rentBurdenType}File"
        else
          @selectorName = "#{@preference}_proofDocument"
          @fileInputName = "#{@preference}_proofFile"

      @setProofType = =>
        # @proofType means that proofOption gets hardcoded to the set value
        if @proofType
          @proofDocument.proofOption = @proofType
          @saveProofOptionToPref()
        else if !@proofDocument || !@proofDocument.file
          @proofDocument.proofOption = null

      @liveOrNeighborhoodPreference = =>
        @preference == 'liveInSf' || @preference == 'neighborhoodResidence'

      @showProofOptionSelector = =>
        return false if @proofType
        !(@proofDocument.file && @proofDocument.file.name)

      @showPreferenceUploader = =>
        @application.preferences[@preference] && !@proofDocument.loading && !@hasPreferenceFile()

      @hasPreferenceFile = =>
        !_.isEmpty(@proofDocument.file) && !@proofDocument.loading

      @uploaderDisabled = =>
        !@proofType && !@proofDocument.proofOption

      @rentBurdenOpts = =>
        {
          address: @address
          rentBurdenType: @rentBurdenType
          index: @proofDocument.id
          docType: @proofDocument.proofOption
          prefType: @preference
        }

      @saveProofOptionToPref = =>
        proofOption = @proofDocument.proofOption
        if @preference == 'rentBurden'
          proofOption = 'Lease and rent proof'
        else if proofOption == 'Copy of Lease'
          proofOption = 'Lease'
        @application.preferences[@preference + '_proofOption'] = proofOption

      @flagForI18n = (str) =>
        ShortFormHelperService.flagForI18n(str)

      @validateFileNameLength = (file) ->
        if file
          if file.name.length > FileUploadService.maxFileNameLength
            @proofDocument.error = @flagForI18n('ERROR.FILE_NAME_TOO_LONG')
          else
            if file.size > FileUploadService.maxFileSizeBytes
              @proofDocument.error = @flagForI18n('ERROR.FILE_UPLOAD')
            else
              true
        else
          @proofDocument.error = @flagForI18n('ERROR.FILE_MISSING')

      @uploadProofFile = (file) =>
        opts =
          prefType: @preference
        if @preference == 'rentBurden'
          opts = @rentBurdenOpts()
        FileUploadService.uploadProof(file, @listing, opts).then =>
          @afterUpload()
        if @preference == 'neighborhoodResidence' || @preference == 'antiDisplacement'
          # if we're uploading for NRHP/ADHP, it also copys info and uploads for liveInSf so that the file info is saved into DB
          ShortFormApplicationService.copyNeighborhoodToLiveInSf(@preference)
          opts.prefType = 'liveInSf'
          FileUploadService.uploadProof(file, @listing, opts)

      @deletePreferenceFile = =>
        opts =
          prefType: @preference
        if @preference == 'rentBurden'
          opts = @rentBurdenOpts()
        FileUploadService.deleteFile(@listing, opts).then =>
          @afterDelete()
          @setProofType()

      @assetPaths = SharedService.assetPaths

      @setProofType()
      return ctrl
  ]
