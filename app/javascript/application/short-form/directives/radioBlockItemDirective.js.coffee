angular.module('dahlia.directives')
.directive 'radioBlockItem', ->
  replace: true
  scope: true
  transclude: true
  template: require('html-loader!application/short-form/directives/radio-block-item.html')

  link: (scope, elem, attrs) ->
    scope.id = "#{attrs.name}_#{_.kebabCase(attrs.value)}"
    scope.user = scope[attrs.user] if attrs.user
    scope.name = attrs.name
    scope.value = attrs.value
    scope.ngRequired = attrs.ngRequired
    scope.onChange = if attrs.onChange then scope[attrs.onChange] else () -> null
    scope.ariaDescribedby = attrs.ariaDescribedby
