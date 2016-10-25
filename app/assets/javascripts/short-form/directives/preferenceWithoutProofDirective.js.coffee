angular.module('dahlia.directives')
.directive 'preferenceWithoutProof', ->
  scope: true
  templateUrl: 'short-form/directives/preference-without-proof.html'

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.description = attrs.description
    scope.preference = attrs.preference
    scope.labelledby = attrs.labelledby
    scope.pref_data_event = attrs.dataevent
