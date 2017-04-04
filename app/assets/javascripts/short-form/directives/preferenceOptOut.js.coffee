angular.module('dahlia.directives')
.directive 'preferenceOptOut',
['ShortFormApplicationService', (ShortFormApplicationService) ->
  scope:
    preference: '@'
    application: '='
    invalid: '@'
    optOutField: '@'
  templateUrl: 'short-form/directives/preference-opt-out.html'

  link: (scope, elem, attrs) ->
    # default e.g. neighborhoodResidenceOptOut
    scope.optOutField ?= "#{scope.preference}OptOut"

    scope.cancelPreference = ->
      ShortFormApplicationService.cancelPreference(scope.preference)
]
