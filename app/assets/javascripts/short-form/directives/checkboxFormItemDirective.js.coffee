angular.module('dahlia.directives')
.directive 'checkboxFormItem', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/checkbox-form-item.html'

  link: (scope, elem, attrs) ->
    scope.name = attrs.name
    scope.option = attrs.option
    scope.id = "#{attrs.name}_#{_.kebabCase(attrs.option)}"
