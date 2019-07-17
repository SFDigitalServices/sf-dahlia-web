angular.module('dahlia.directives')
.directive 'raceEthnicityForm', ->
  replace: true
  scope: true
  template: require('html-loader!application/short-form/directives/race-ethnicity-form.html')

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user
