angular.module('dahlia.directives')
.directive 'inputError', ['$compile', ($compile) ->
  scope: true

  link: (scope, elem, attrs) ->
    scope.translatedError = attrs.translatedError
    scope.inputName = attrs.name
    scope.errorId = attrs.ariaDescribedby
    template = '<div ng-include="\'short-form/directives/input-error.html\'"></div>'

    elem.after($compile(template)(scope))
]
