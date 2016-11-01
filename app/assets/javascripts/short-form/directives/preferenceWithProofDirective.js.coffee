angular.module('dahlia.directives')
.directive 'preferenceWithProof', ->
  scope: true
  templateUrl: 'short-form/directives/preference-with-proof.html'

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.description = attrs.translatedDescription
    scope.preference = attrs.preference
    scope.labelledby = attrs.labelledby
    scope.pref_data_event = attrs.dataevent

    scope.reset_preference_data = (preference) ->
      scope.preferences[preference + '_household_member'] = null
      scope.preferences[preference + '_proof_option'] = null
      scope.deletePreferenceFile(preference)
