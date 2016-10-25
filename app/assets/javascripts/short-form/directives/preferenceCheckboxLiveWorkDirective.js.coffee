angular.module('dahlia.directives')
.directive 'preferenceCheckboxLiveWork', ->
  scope: true
  templateUrl: 'short-form/directives/preference-checkbox-live-work.html'

  link: (scope, elem, attrs) ->
