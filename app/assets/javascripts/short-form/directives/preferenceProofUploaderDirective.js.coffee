angular.module('dahlia.directives')
.directive 'preferenceProofUploader',
['FileUploadService', (FileUploadService) ->
  scope: true
  templateUrl: 'short-form/directives/preference-proof-uploader.html'

  link: (scope, elem, attrs) ->

    scope.opts = {}
    if scope.preference == 'rentBurden'
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
