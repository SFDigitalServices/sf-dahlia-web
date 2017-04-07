angular.module('dahlia.directives')
.directive 'preferenceProofUploader',
['FileUploadService', (FileUploadService) ->
  scope: true
  templateUrl: 'short-form/directives/preference-proof-uploader.html'

  link: (scope, elem, attrs) ->

    if scope.preference == 'rentBurden'
      # console.log scope.address
      scope.rentBurdenType = attrs.rentBurdenType
      # console.log scope.preferences.rentBurden_proof[scope.address]
      if scope.rentBurdenType == 'lease'
        scope.proof_file = scope.preferences.rentBurden_proof[scope.address].lease_file.file
    else
      scope.proof_file = scope.application.preferences[scope.preference_proof_file]

    scope.show_preference_uploader = ->
      scope.preferences[scope.preference] &&
        !scope.preferenceFileIsLoading(scope.preference_proof_file) &&
        !scope.hasPreferenceFile(scope.preference_proof_file)

    scope.uploadProofFile = ($file) ->
      # call appropriate method on controller
      if scope.preference == 'rentBurden'
        scope.uploadRentBurdenProof($file, scope.rentBurdenOpts())
      else
        proof_option = scope.application.preferences[preference_proof_option]
        scope.uploadProof($file, scope.preference, proof_option)

    scope.rentBurdenOpts = ->
      {
        address: scope.address
        rentBurdenType: scope.rentBurdenType
        docType: 'Copy of Lease'
      }

    scope.uploadProof = (file, prefType, docType) ->
      FileUploadService.uploadProof(file, prefType, docType, scope.listing.Id)

    scope.uploadRentBurdenProof = (file, opts) ->
      opts.listing_id = scope.listing_id
      FileUploadService.uploadRentBurdenProof(file, opts)

    scope.hasPreferenceFile = () ->
      if scope.preference == 'rentBurden'
        FileUploadService.hasPreferenceFile(scope.preference_proof_file, scope.rentBurdenOpts())
      else
        FileUploadService.hasPreferenceFile(scope.preference_proof_file)

    scope.deletePreferenceFile = () ->
      FileUploadService.deletePreferenceFile(scope.preference, scope.listing.Id)

    scope.preferenceFileError = () ->
      FileUploadService.preferenceFileError(scope.preference_proof_file)

    scope.preferenceFileIsLoading = () ->
      FileUploadService.preferenceFileIsLoading(scope.preference_proof_file)

]
