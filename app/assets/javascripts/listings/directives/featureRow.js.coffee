angular.module('dahlia.directives')
.directive 'featureRow', ->
  scope: true
  replace: true
  templateUrl: 'listings/directives/feature-row.html'

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.description = attrs.description
