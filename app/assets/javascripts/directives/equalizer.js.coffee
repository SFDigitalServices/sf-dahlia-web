angular.module('dahlia.directives')
.directive 'equalizer', [ ->
  restrict: 'A'

  link: (scope, element, attrs) ->
    items = angular.element(document.querySelectorAll('[equalizer-watch]'))
    biggest = _.max(items, (e) ->
      e.clientHeight
    )
    items.css 'height', biggest.clientHeight+'px'
]
