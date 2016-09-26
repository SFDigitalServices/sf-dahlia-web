angular.module('dahlia.directives')
.directive 'backToApplicationLink', [ ->
  replace: true
  scope: true
  templateUrl: 'account/directives/back-to-application-link.html'
]
