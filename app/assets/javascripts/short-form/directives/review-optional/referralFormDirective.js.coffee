angular.module('dahlia.directives')
.directive 'referralForm', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/review-optional/referral-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user

