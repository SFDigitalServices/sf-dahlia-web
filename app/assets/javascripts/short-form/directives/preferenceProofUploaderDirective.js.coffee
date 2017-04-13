angular.module('dahlia.directives')
.directive 'preferenceProofUploader', ['$translate', ($translate) ->
  scope: true
  templateUrl: 'short-form/directives/preference-proof-uploader.html'

  link: (scope, elem, attrs) ->
    # translate instructions here, rather than in template, so they can
    # contain html line breaks (<br>)
    scope.uploadProofInstructions1 = $translate.instant('LABEL.UPLOAD_PROOF_INSTRUCTIONS_1')
    scope.uploadProofInstructions2 = $translate.instant('LABEL.UPLOAD_PROOF_INSTRUCTIONS_2')

    scope.show_preference_uploader = ->
      scope.preferences[scope.preference] &&
        !scope.preferenceFileIsLoading(scope.preference_proof_file) &&
        !scope.hasPreferenceFile(scope.preference_proof_file)
]
