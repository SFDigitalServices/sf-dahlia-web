angular.module('dahlia.directives')
.directive 'radioBlockItem', ->
  replace: true
  scope: true
  transclude: true
  templateUrl: 'short-form/directives/radio-block-item.html'

  link: (scope, elem, attrs) ->
    console.log('User in the directive', attrs.user)
    console.log('scope in the directive', scope[attrs.user])
    console.log('Whats the scope')
    scope.id = "#{attrs.name}_#{_.kebabCase(attrs.value)}"
    scope.user = scope[attrs.user] if attrs.user
    scope.name = attrs.name
    scope.value = attrs.value
    scope.ngRequired = attrs.ngRequired
    scope.onChange = if attrs.onChange then scope[attrs.onChange] else () -> null
    scope.ariaDescribedby = attrs.ariaDescribedby
