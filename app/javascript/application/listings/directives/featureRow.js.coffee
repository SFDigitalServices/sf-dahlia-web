angular.module('dahlia.directives')
.directive 'featureRow', ->
  scope: true
  replace: true
  template: require('html-loader!application/listings/directives/feature-row.html')

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.description = attrs.description
    scope.skiptranslate = attrs.skiptranslate
