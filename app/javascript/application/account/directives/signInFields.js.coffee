angular.module('dahlia.directives')
.directive 'signInFields', ['$state', ($state) ->
  replace: true
  scope: true
  template: require('html-loader!application/account/directives/sign-in-fields.html')

  link: (scope, elem, attrs) ->
    scope.userInShortFormSession = $state.current.name.indexOf('dahlia.short-form-application') > -1

]
