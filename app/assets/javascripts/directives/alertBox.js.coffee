angular.module('dahlia.directives')
.directive 'alertBox', ['$translate', ($translate) ->
  restrict: 'E'
  scope:
    formObject: '='
    stateName: '='
    hideAlert: '='
    missingInfo: '='
  templateUrl: 'directives/alert-box.html'

  link: (scope, elem, attrs) ->
    scope.showAlert = ->
      form = scope.formObject
      return false unless form
      scope.hideAlert = true if form.$submitted && form.$valid
      # show alert if we've submitted an invalid form, and we haven't manually hidden it
      form.$submitted && form.$invalid && scope.hideAlert == false

    scope.alertText = ->
      if scope.altContactTypeError()
        $translate.instant("ERROR.ALT_CONTACT_TYPE")
      else
        $translate.instant("ERROR.FORM_SUBMISSION")

    scope.altContactTypeError = ->
      scope.stateName == 'dahlia.short-form-application.alternate-contact-type' &&
        scope.missingInfo && scope.missingInfo().length > 0

    scope.showAltContactMessage = ->
      scope.showAlert() && scope.altContactTypeError()
]
