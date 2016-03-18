angular.module('dahlia.directives')
.directive 'alertBox', ->
  restrict: 'E'
  scope:
    formObject: '='
    stateName: '='
    hideAlert: '='
    missingInfo: '='
  link: (scope, elem, attrs) ->
    scope.showAlert = ->
      form = scope.formObject
      return false unless form
      scope.hideAlert = true if form.$submitted && form.$valid
      # show alert if we've submitted an invalid form, and we haven't manually hidden it
      form.$submitted && form.$invalid && scope.hideAlert == false

    scope.alertText = ->
      if scope.altContactTypePage()
        "Since you are not able to provide some of the required contact information,
        we'll need you to provide alternate contact information."
      else
        "You'll need to resolve any errors before moving on."

    scope.altContactTypePage = ->
      scope.stateName == 'dahlia.short-form-application.alternate-contact-type'

  templateUrl: 'directives/alertBox/alert-box.html'
