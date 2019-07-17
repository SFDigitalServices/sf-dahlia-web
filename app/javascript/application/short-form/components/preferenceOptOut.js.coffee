angular.module('dahlia.components')
.component 'preferenceOptOut',
  bindings:
    application: '<'
    preference: '@'
    invalid: '<'
    cancelPreference: '&'
  template: require('html-loader!application/short-form/components/preference-opt-out.html')

  controller: ->
    ctrl = @
    return ctrl
