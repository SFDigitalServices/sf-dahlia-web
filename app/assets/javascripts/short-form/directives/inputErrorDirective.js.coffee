angular.module('dahlia.directives')
.directive 'inputError', ['$compile', ($compile) ->
  scope: true
  # see: http://stackoverflow.com/a/19228302/260495
  # terminal: true
  # priority: 1000

  link: (scope, elem, attrs) ->
    scope.translatedError = attrs.translatedError
    scope.inputName = attrs.name
    scope.errorId = attrs.ariaDescribedby
    template = '<div ng-include="\'short-form/directives/input-error.html\'"></div>'

    #
    # latinRegex = new RegExp("^[A-z0-9\u00C0-\u017E\s'\.,-\/#!$%\^&\*;:{}=\-_`~()]+$")
    # elem.attr('ng-pattern', latinRegex)
    # unless elem.attr('ng-class')
    #   elem.attr('ng-class', '{error: inputInvalid(inputName)}')
    # # to avoid infinite loop, since we're about to recompile
    # elem.removeAttr('input-error')
    # $compile(elem)(scope)

    elem.after($compile(template)(scope))
]
