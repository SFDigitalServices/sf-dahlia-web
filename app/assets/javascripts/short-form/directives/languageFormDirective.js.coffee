angular.module('dahlia.directives')
.directive 'languageForm', ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/language-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user

    scope.languageNotListed = ->
      scope.user.primaryLanguage == 'Not Listed'

    scope.resetLanguageOther = ->
      scope.user.otherLanguage = null
