angular.module('dahlia.directives')
.directive 'pageCount', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/page-count.html'

  link: (scope, elem, attrs) ->
    scope.currentIndexofSection = ->
      scope.navService.currentIndexofSection()

    scope.totalIndexofSection = ->
      scope.navService.totalIndexofSection()
