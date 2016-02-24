angular.module('customDirectives', [])
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
