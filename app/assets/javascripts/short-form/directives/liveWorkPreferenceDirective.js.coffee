angular.module('dahlia.directives')
.directive 'liveWorkPreference',
['ShortFormApplicationService', (ShortFormApplicationService) ->
  scope: true
  templateUrl: 'short-form/directives/live-work-preference.html'

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.description = attrs.translatedDescription
    scope.labelledby = attrs.labelledby
    scope.pref_data_event = attrs.dataevent
    scope.required = attrs.required
    # note: preference data also gets re-initialized via ng-init in the template
    # because the template has access to the parent functions

    scope.reset_livework_data = ->
      ShortFormApplicationService.cancelOptOut('liveWorkInSf')
      # we don't want to totally "cancelPreference" for live and work
      # otherwise it would unset liveWorkInSf
      ShortFormApplicationService.unsetPreferenceFields('workInSf')
      ShortFormApplicationService.unsetPreferenceFields('liveInSf')

    scope.live_or_work_selected = ->
      scope.preferences.liveInSf || scope.preferences.workInSf
]
