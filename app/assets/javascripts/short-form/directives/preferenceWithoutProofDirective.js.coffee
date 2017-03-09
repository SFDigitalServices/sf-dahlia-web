angular.module('dahlia.directives')
.directive 'preferenceWithoutProof', ->
  scope: true
  templateUrl: 'short-form/directives/preference-without-proof.html'

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.description = attrs.translatedDescription
    scope.preference = attrs.preference
    scope.pref_data_event = attrs.dataevent
    scope.show_preference_description = false
