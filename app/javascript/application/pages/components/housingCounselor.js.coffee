angular.module('dahlia.components')
.component 'housingCounselor',
  bindings:
    counselor: '<'
  template: require('html-loader!application/pages/components/housing-counselor.html')

  controller: ->
    ctrl = @
    return ctrl
