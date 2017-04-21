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
    ['ShortFormApplicationService', 'FileUploadService', '$translate'
    (ShortFormApplicationService, FileUploadService, $translate) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @buttonLabel ?= $translate.instant('LABEL.UPLOAD_PROOF_OF_PREFERENCE') unless @buttonLabel
      @selectorName = "#{@preference}_proofDocument"
      @fileInputName = "#{@preference}_proofFile"
      @listingId = ShortFormApplicationService.listing.Id

      @setProofType = =>
        # @proofType means that proofOption gets hardcoded to the set value
        if @proofType
          @proofDocument.proofOption = @proofType
        else if !@proofDocument && !@proofDocument.file
          @proofDocument.proofOption = null

      @liveOrNeighborhoodPreference = =>
        @preference == 'liveInSf' || @preference == 'neighborhoodResidence'

      @showProofOptionSelector = =>
        return false if @proofType
        !(@proofDocument.file && @proofDocument.file.name)

      @showPreferenceUploader = =>
        @application.preferences[@preference] &&
          !@proofDocument.loading &&
          !@hasPreferenceFile()

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
        }

      @uploadProofFile = ($file) =>
        opts = {}
        if @preference == 'rentBurden'
          opts = @rentBurdenOpts()
        FileUploadService.uploadProof($file, @preference, @listingId, opts).then =>
          @afterUpload()

      @deletePreferenceFile = =>
        opts = {}
        if @preference == 'rentBurden'
          opts = @rentBurdenOpts()
        FileUploadService.deletePreferenceFile(@preference, @listingId, opts).then =>
          @afterDelete()
          @setProofType()

      @setProofType()
      return ctrl
  ]
