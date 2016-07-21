angular.module('dahlia.directives')
.directive 'alertBox', ['$translate', '$state', ($translate, $state) ->
  restrict: 'E'
  scope:
    formObject: '=?'
    hideAlert: '=?'
    missingInfo: '=?'
    householdEligibilityErrorMessage: '=?'
    invert: '=?'
    shortForm: '=?'
    accountError: '=?'

  templateUrl: 'directives/alert-box.html'

  link: (scope, elem, attrs) ->
    if scope.shortForm
      # shortForm "default settings"
      scope.formObject ?= scope.$parent.form.applicationForm
      scope.hideAlert ?= scope.$parent.hideAlert
      scope.invert ?= true
      # scope.addressFailedValidation = scope.$parent.addressFailedValidation

    scope.showAlert = ->
      if scope.accountError && scope.accountError.message
        return true
      if scope.householdEligibilityErrorMessage
        return true
      if $state.params.error
        return true
      else
        form = scope.formObject
        return false unless form
        return false if form.$submitted && form.$valid
        # show alert if we've submitted an invalid form, and we haven't manually hidden it
        form.$submitted && form.$invalid && scope.hideAlert == false

    scope.alertText = ->
      if scope.altContactTypeError()
        $translate.instant("ERROR.ALT_CONTACT_TYPE")
      else if scope.householdEligibilityErrorMessage
        $translate.instant("ERROR.NOT_ELIGIBLE") + " " + scope.householdEligibilityErrorMessage
      else if scope.accountError && (scope.accountError.message == 'Email already in use')
        $translate.instant("ERROR.EMAIL_ALREADY_IN_USE")
      else
        $translate.instant("ERROR.FORM_SUBMISSION")

    scope.altContactTypeError = ->
      $state.current.name == 'dahlia.short-form-application.alternate-contact-type' &&
        scope.missingInfo && scope.missingInfo().length > 0

    scope.showAltContactMessage = ->
      scope.showAlert() && scope.altContactTypeError()

    scope.contactTypeData = (contactType) ->
      {contactType: contactType}

    scope.isInverted = ->
      if scope.invert
        return 'invert no-margin'

    scope.isIconInverted = ->
      if !scope.invert
        return 'i-oil'

]
