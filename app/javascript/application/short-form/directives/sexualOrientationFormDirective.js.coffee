angular.module('dahlia.directives')
.directive 'sexualOrientationForm', ->
  replace: true
  scope: true
  template: require('html-loader!application/short-form/directives/sexual-orientation-form.html')

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user
