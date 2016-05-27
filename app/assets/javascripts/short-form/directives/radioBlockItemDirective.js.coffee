angular.module('dahlia.directives')
.directive 'radioBlockItem', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/radio-block-item.html'

  link: (scope, elem, attrs) ->
    scope.id = "#{attrs.name}_#{_.kebabCase(attrs.value)}"
    scope.user = scope[attrs.user] if attrs.user
    scope.name = attrs.name
    scope.value = attrs.value
    scope.ngRequired = attrs.ngRequired
