angular.module('dahlia.directives')
.directive 'shortFormBack', ['$state', ($state) ->
  restrict: 'E'
  replace: true
  scope: true
  templateUrl: 'short-form/directives/short-form-back.html'
]