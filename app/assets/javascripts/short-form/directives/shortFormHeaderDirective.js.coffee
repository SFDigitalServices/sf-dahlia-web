angular.module('dahlia.directives')
.directive 'shortFormHeader', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/short-form-header.html'

  link: (scope, elem, attrs) ->
    scope.loggedInMessage = attrs.loggedInMessage
    scope.noBorder = attrs.noBorder
    scope.hasBorderBottom = ->
      return 'border-bottom' unless scope.noBorder
