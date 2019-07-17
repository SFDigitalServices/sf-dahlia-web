angular.module('dahlia.directives')
.directive 'backToApplicationLink', [ ->
  replace: true
  scope: true
  template: require('html-loader!application/account/directives/back-to-application-link.html')
]
