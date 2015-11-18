angular.module('customDirectives', [])
.directive 'backButton', ['$window', ($window) ->
  restrict: 'A'
  link: (scope, elem, attrs) ->
    elem.bind 'click', ->
      $window.history.back()
]
