AccountController = ($scope, $state, $document, $translate, AccountService) ->
  $scope.rememberedState = AccountService.rememberedState
  $scope.form = {}
  # userAuth is used as model for inputs in create-account form
  $scope.userAuth = AccountService.userAuth
  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false
  $scope.submitDisabled = false
  $scope.hideMessage = false

  $scope.handleErrorState = ->
    # show error alert
    $scope.hideAlert = false
    el = angular.element(document.getElementById('form-wrapper'))
    # uses duScroll aka 'angular-scroll' module
    topOffset = 0
    duration = 400 # animation speed in ms
    $document.scrollToElement(el, topOffset, duration)

  $scope.inputInvalid = (fieldName, identifier = '') ->
    form = $scope.form.accountForm
    fieldName = if identifier then "#{identifier}_#{fieldName}" else fieldName
    field = form[fieldName]
    if form && field
      field.$invalid && (field.$touched || form.$submitted)

  $scope.createAccount = ->
    form = $scope.form.accountForm
    if form.$valid
      $scope.submitDisabled = true
      # AccountService.userAuth will have been modified by form inputs
      AccountService.createAccount().then ->
        $scope.submitDisabled = false
        # reset the form
        form.$setUntouched()
        form.$setPristine()
    else
      $scope.handleErrorState()

  $scope.signIn = ->
    form = $scope.form.accountForm
    if form.$valid
      $scope.submitDisabled = true
      # AccountService.userAuth will have been modified by form inputs
      AccountService.signIn().then ->
        $scope.submitDisabled = false
        if AccountService.loggedIn()
          return $state.go('dahlia.my-account')
    else
      $scope.handleErrorState()

  $scope.isLocked = (field) ->
    AccountService.lockedFields[field]

  $scope.emailConfirmInstructions = ->
    $translate.instant('CREATE_ACCOUNT.EMAIL_CONFIRM_INSTRUCTIONS')

############################################################################################

AccountController.$inject = [
  '$scope', '$state', '$document', '$translate', 'AccountService'
]

angular
  .module('dahlia.controllers')
  .controller('AccountController', AccountController)
