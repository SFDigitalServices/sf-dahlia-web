angular.module('dahlia.directives')
.directive 'checkboxFormItem', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/checkbox-form-item.html'

  link: (scope, elem, attrs) ->
    scope.name = attrs.name
    scope.option = attrs.option
    scope.label = attrs.label || attrs.option
    scope.user = scope[attrs.user || 'applicant']
    scope.isDisabled = scope[attrs.isDisabled] || () -> false
    scope.showErrorMessage = attrs.showErrorMessage != 'false'
    scope.error = attrs.error
    scope.isRequired = () ->
      return false if attrs.isRequired == 'false'
      attrs.isRequired || false
    scope.id = "#{attrs.name}_#{_.kebabCase(attrs.option)}"

    scope.onClick = ->
      if scope[attrs.onClick]
        scope[attrs.onClick]()
      # trigger form element being "touched" to fix angular issue with checkboxes sharing single "name"
      # see http://stackoverflow.com/a/34728533
      scope.form.applicationForm[scope.name].$setTouched()
