angular.module('dahlia.directives')
.directive 'shortFormHeader', ->
  replace: true
  scope: true
  transclude: true
  template: require('html-loader!application/short-form/directives/short-form-header.html')

  link: (scope, elem, attrs) ->
    scope.loggedInMessage = attrs.loggedInMessage
    scope.noBorder = attrs.noBorder
    scope.featuredLeader = attrs.featuredLeader
    scope.hasBorderBottom = ->
      return 'border-bottom' unless (scope.noBorder || scope.featuredLeader)
