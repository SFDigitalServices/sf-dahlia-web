angular.module('dahlia.directives')
.directive 'lockIcon', ->
  replace: true
  scope: true
  template: require('html-loader!application/short-form/directives/lock-icon.html')
