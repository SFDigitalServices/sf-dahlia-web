angular.module('dahlia.directives')
.directive 'preferenceOptOut', ->
  scope: true
  templateUrl: 'short-form/directives/preference-opt-out.html'

  link: (scope, elem, attrs) ->
    scope.preference = attrs.preference
    scope.model = attrs.model

    scope.uncheckPreference = ->
      # calls ShortFormApplicationController
      scope.cancelPreference(scope.preference)
