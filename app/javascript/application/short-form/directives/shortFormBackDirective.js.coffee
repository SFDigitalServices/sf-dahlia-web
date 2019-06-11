angular.module('dahlia.directives')
.directive 'shortFormBack', ['$state', ($state) ->
  restrict: 'E'
  replace: true
  scope: true
  templateUrl: 'short-form/directives/short-form-back.html'

  link: (scope, elem, attrs) ->
    # gets these parent scope functions from ShortFormApplicationController
    scope.showBackButton = scope.hasBackButton()
    scope.backPageState = scope.backPageState()
]
