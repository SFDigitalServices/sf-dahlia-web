angular.module('dahlia.directives')
.directive 'preferenceOptOut',
['ShortFormApplicationService', (ShortFormApplicationService) ->
  scope:
    preference: '@'
    application: '='
    invalid: '@'
  templateUrl: 'short-form/directives/preference-opt-out.html'

  link: (scope, elem, attrs) ->
    scope.cancelPreference = ->
      ShortFormApplicationService.cancelPreference(scope.preference)
]
