angular.module('dahlia.directives')
.directive 'preferenceOptOut', ->
  scope: true
  templateUrl: 'short-form/directives/preference-opt-out.html'

  link: (scope, elem, attrs) ->
    scope.preference = attrs.preference
    # look up the optOutField name using ShortFormApplicationController
    scope.model = scope.optOutField(scope.preference)

    scope.uncheckPreference = ->
      # calls ShortFormApplicationController
      scope.cancelPreference(scope.preference)
