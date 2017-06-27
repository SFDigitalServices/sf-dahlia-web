angular.module('dahlia.directives')
.directive 'convertToNumber', ->
  restrict: 'A'
  require: 'ngModel'

  link: (scope, elem, attrs, ngModel) ->
    ngModel.$parsers.push (val) ->
      if val then Number.parseInt(val, 10) else ''
    ngModel.$formatters.push (val) ->
      if val then '' + val else ''
