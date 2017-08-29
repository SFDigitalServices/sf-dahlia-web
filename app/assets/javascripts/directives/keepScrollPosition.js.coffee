angular.module('dahlia.directives')
.directive 'keepScrollPosition',
['$state', '$window', '$timeout', '$location', ($state, $window, $timeout, $location) ->
  # cache scroll position of each route's templateUrl
  scrollPositions = {}
  locationPath = ''

  restrict: 'A'
  scope: true
  link: (scope, element, attrs) ->
    scope.$on '$stateChangeStart', ->
      locationPath = $location.path()
      # store scroll position for the current view
      if $state.current.name
        scrollPositions[$state.current.name + JSON.stringify($state.params)] = [
          $window.pageXOffset
          $window.pageYOffset
        ]
    scope.$on '$stateChangeSuccess', (event) ->
      # if location path stays the same, browser history API is in use
      usedBrowserNavigation = locationPath == $location.path()
      prevPosition = scrollPositions[$state.current.name + JSON.stringify($state.params)]
      if usedBrowserNavigation && prevPosition
        $timeout ->
          $window.scrollTo prevPosition[0], prevPosition[1]
]
