angular.module('dahlia.directives')
.directive 'preferenceProofUploader', ->
  scope: true
  templateUrl: 'short-form/directives/preference-proof-uploader.html'

  link: (scope, elem, attrs) ->
    scope.show_preference_uploader = ->
      scope.preferences[scope.preference] &&
        !scope.preferenceFileIsLoading(scope.preference_proof_file) &&
        !scope.hasPreferenceFile(scope.preference_proof_file)
