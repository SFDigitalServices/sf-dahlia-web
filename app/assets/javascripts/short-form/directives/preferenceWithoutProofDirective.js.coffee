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

    # this is only shown on pref without proof aka COP/DTHP
    scope.display_more_info_link = true

    scope.reset_preference_data = (preference) ->
      scope.preferences["#{preference}_household_member"] = null
