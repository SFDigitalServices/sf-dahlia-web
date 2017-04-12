angular.module('dahlia.directives')
.directive 'preferenceProofUploader',
['FileUploadService', '$translate', (FileUploadService, $translate) ->
  scope: true
  templateUrl: 'short-form/directives/preference-proof-uploader.html'

  link: (scope, elem, attrs) ->

    # this if/else is for the combo liveWork preference to display the right proofOptionLabel
    if scope.preference == 'liveInSf'
      scope.proofOptionLabel = $translate.instant('LABEL.PREFERENCE_PROOF_ADDRESS_DOCUMENTS')
    else if scope.preference == 'workInSf'
      scope.proofOptionLabel = $translate.instant('LABEL.PREFERENCE_PROOF_DOCUMENTS')

    scope.proofOptionLabel ?= attrs.proofOptionLabel
    scope.buttonLabel = attrs.buttonLabel || $translate.instant('LABEL.UPLOAD_PROOF_OF_PREFERENCE')

    scope.opts = {}
    if scope.preference == 'rentBurden'
      scope.proofType = attrs.proofType
      scope.rentBurdenType = attrs.rentBurdenType
      scope.index = attrs.index
      scope.opts =
        listing_id: scope.listing.Id
        address: scope.address
        rentBurdenType: scope.rentBurdenType
        index: scope.index
        # TODO: for rent, docType should come from the select dropdown
        docType: 'Copy of Lease'

      scope.proof_file = scope.rentBurdenFile(scope.opts).file
    else
      scope.proof_file = scope.application.preferences[scope.preference_proof_file]

    scope.show_proof_option_selector = ->
      # having a set proofType hides the proof type selector
      !scope.proofType

    scope.show_preference_uploader = ->
      scope.preferences[scope.preference] &&
        !scope.preferenceFileIsLoading(scope.opts) &&
        !scope.hasPreferenceFile(scope.opts)

    scope.uploadProofFile = ($file, opts) ->
      if scope.preference == 'rentBurden'
        FileUploadService.uploadRentBurdenProof($file, opts).then ->
          fileObj = FileUploadService.rentBurdenFile(opts)
          if fileObj
            scope.proof_file = scope.rentBurdenFile(scope.opts).file
      else
        proof_option = scope.application.preferences[scope.preference_proof_option]
        FileUploadService.uploadProof($file, scope.preference, proof_option, scope.listing.Id).then ->
          scope.proof_file = scope.application.preferences[scope.preference_proof_file]

]
