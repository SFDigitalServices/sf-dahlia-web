angular.module('dahlia.components')
.component 'preferenceOptOut',
  bindings:
    application: '<'
    preference: '@'
    invalid: '<'
    cancelPreference: '&'
  templateUrl: 'short-form/components/preference-opt-out.html'

  controller: ->
    ctrl = @
    return ctrl
