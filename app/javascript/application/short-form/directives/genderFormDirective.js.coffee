angular.module('dahlia.directives')
.directive 'genderForm', ->
  replace: true
  scope: true
  template: require('html-loader!application/short-form/directives/gender-form.html')

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user

    scope.genderNotListed = ->
      scope.user.gender == 'Not Listed'

    scope.resetGenderOther = ->
      scope.user.genderOther = null
