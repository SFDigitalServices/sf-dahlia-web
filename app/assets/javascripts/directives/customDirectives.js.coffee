angular.module('dahlia.directives')
.directive 'backButton', ['$window', ($window) ->
  restrict: 'A'
  link: (scope, elem, attrs) ->
    elem.bind 'click', ->
      $window.history.back()
]
.directive 'adjustCarouselHeight', ['$window', ($window) ->
  link: (scope, elem, attrs) ->
    elem.bind 'load', ->
      scope.adjustCarouselHeight(elem)

    # to support resize of the carousel after you resize your window
    angular.element($window).bind 'resize', ->
      scope.adjustCarouselHeight(elem)
]
# http://stackoverflow.com/a/27050315/260495
.directive 'numericOnly', ->
  require: 'ngModel'
  link: (scope, elem, attrs, modelCtrl) ->
    modelCtrl.$parsers.push (inputValue) ->
      transformedInput = if inputValue then inputValue.replace(/[^\d]/g, '') else null
      if transformedInput != inputValue
        modelCtrl.$setViewValue transformedInput
        modelCtrl.$render()
      transformedInput
