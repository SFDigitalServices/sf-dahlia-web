AccountController = ($scope, $state, $document, $translate, AccountService, ShortFormApplicationService) ->
  $scope.rememberedShortFormState = AccountService.rememberedShortFormState
  $scope.form = {}
  # userAuth is used as model for inputs in create-account form
  $scope.userAuth = AccountService.userAuth
  $scope.createdAccount = AccountService.createdAccount
  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false
  $scope.hideMessage = false
  $scope.accountError = AccountService.accountError
  $scope.submitDisabled = false

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
      shortFormSession = null
      if $scope._userInShortFormSession()
        shortFormSession =
          uid: ShortFormApplicationService.session_uid
          userkey: ShortFormApplicationService.userkey
      AccountService.createAccount(shortFormSession).then( (success) ->
        $scope.submitDisabled = false
        if success
          form.$setUntouched()
          form.$setPristine()
          $scope._createAccountRedirect()
          $scope.hideAlert = false
      )
    else
      $scope.handleErrorState()

  $scope.signIn = ->
    form = $scope.form.accountForm
    if form.$valid
      $scope.submitDisabled = true
      # AccountService.userAuth will have been modified by form inputs
      AccountService.signIn().then( ->
        $scope.submitDisabled = false
        if AccountService.loggedIn()
          return $state.go('dahlia.my-account')
      ).catch( ->
        $scope.submitDisabled = false
      )
    else
      $scope.handleErrorState()

  $scope.$on 'auth:login-error', (ev, reason) ->
    if (reason.error == 'bad_credentials')
      $scope.accountError = {message: $translate.instant('SIGN_IN.BAD_CREDENTIALS')}
      $scope.handleErrorState()
    else if (reason.error == 'not_confirmed')
      AccountService.openUnconfirmedLoginModal()

  $scope.isLocked = (field) ->
    AccountService.lockedFields[field]

  $scope.emailConfirmInstructions = ->
    $translate.instant('CREATE_ACCOUNT.EMAIL_CONFIRM_INSTRUCTIONS')

  $scope.resendConfirmationEmail = ->
    AccountService.resendConfirmationEmail()

  $scope._createAccountRedirect = ->
    # send to sign in state if user created account from saving application
    if $scope._userInShortFormSession()
      ShortFormApplicationService.submitApplication({draft: true, attachToAccount: true}).then(
        $state.go('dahlia.sign-in', {skipConfirm: true})
      )
    else
      $state.go('dahlia.sign-in')

  $scope._userInShortFormSession = ->
    $state.current.name == 'dahlia.short-form-application.create-account'

  $scope.clearCreatedAccount = ->
    angular.copy({}, $scope.createdAccount)

AccountController.$inject = ['$scope', '$state', '$document', '$translate', 'AccountService', 'ShortFormApplicationService']

angular
  .module('dahlia.controllers')
  .controller('AccountController', AccountController)
