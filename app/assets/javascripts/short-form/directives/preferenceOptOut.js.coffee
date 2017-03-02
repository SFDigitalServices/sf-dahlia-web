angular.module('dahlia.directives')
.directive 'preferenceOptOut',
['ShortFormApplicationService', (ShortFormApplicationService) ->
  scope:
    preference: '@'
    application: '='
  templateUrl: 'short-form/directives/preference-opt-out.html'

  link: (scope, elem, attrs) ->
    scope.optOutField = ShortFormApplicationService.optOutFields[scope.preference]

    scope.cancelPreference = ->
      ShortFormApplicationService.cancelPreference(scope.preference)
]
