angular.module('dahlia.directives')
.directive 'shortFormSaveAndSubmit', ['$translate', ($translate) ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/short-form-save-and-submit.html'

  link: (scope, elem, attrs) ->
    scope.submitValue = attrs.submitValue || $translate.instant('T.NEXT')
    scope.hasNextButton = if attrs.nextButton == "false" then false else true

]
