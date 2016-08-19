AccountController = ($scope, $state, $document, $translate, AccountService, ShortFormApplicationService) ->
  $scope.rememberedShortFormState = AccountService.rememberedShortFormState
  $scope.form = { current: {} }
  # userAuth is used as model for inputs in create-account form
  $scope.userAuth = AccountService.userAuth
  $scope.myApplications = AccountService.myApplications
  $scope.createdAccount = AccountService.createdAccount
  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false
  $scope.hideMessage = false
  $scope.accountError = AccountService.accountError
  $scope.accountSuccess = AccountService.accountSuccess
  $scope.submitDisabled = false
  $scope.resendDisabled = false
  # track if user has re-sent confirmation inside the modal
  $scope.resentConfirmationMessage = null
  $scope.userDataForContact = {}
  $scope.emailChanged = false
  $scope.nameOrDOBChanged = false

  $scope.passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+){8,}$/

  $scope.accountForm = ->
    # pick up which ever one is defined (the other will be undefined)
    $scope.form.signIn ||
    $scope.form.createAccount ||
    $scope.form.updatePassword ||
    $scope.form.current

  $scope.handleErrorState = ->
    if !$scope.accountError.message
      $scope.accountError.message = $translate.instant('ERROR.FORM_SUBMISSION')
    # show error alert
    $scope.hideAlert = false
    el = angular.element(document.getElementById('form-wrapper'))
    # uses duScroll aka 'angular-scroll' module
    topOffset = 0
    duration = 400 # animation speed in ms
    $document.scrollToElement(el, topOffset, duration)

  $scope.inputInvalid = (fieldName, identifier = '') ->
    form = $scope.accountForm()
    return false unless form
    fieldName = if identifier then "#{identifier}_#{fieldName}" else fieldName
    field = form[fieldName]
    if form && field
      field.$invalid && (field.$touched || form.$submitted)

  $scope.createAccount = ->
    form = $scope.accountForm()
    if form.$valid
      $scope.accountError.message = null
      $scope.submitDisabled = true
      # AccountService.userAuth will have been modified by form inputs
      shortFormSession = null
      if $scope._userInShortFormSession()
        shortFormSession =
          uid: ShortFormApplicationService.session_uid
      $scope.userDataForContact = AccountService.userDataForContact()
      AccountService.createAccount(shortFormSession).then( (success) ->
        if success
          form.$setUntouched()
          form.$setPristine()
          $scope._createAccountRedirect()
          $scope.userDataForContact = {}
      ).catch( ->
        $scope.handleErrorState()
        $scope.submitDisabled = false
      )
    else
      $scope.handleErrorState()

  $scope.signIn = ->
    form = $scope.accountForm()
    if form.$valid
      $scope.submitDisabled = true
      # AccountService.userAuth will have been modified by form inputs
      AccountService.signIn().then( (success) ->
        $scope.submitDisabled = false
        if success
          form.$setUntouched()
          form.$setPristine()
          $scope._signInRedirect()
      ).catch( ->
        $scope.handleErrorState()
        $scope.submitDisabled = false
      )
    else
      $scope.handleErrorState()

  $scope.requestPasswordReset = ->
    AccountService.requestPasswordReset()

  $scope.updatePassword = (type) ->
    $scope.form.current = $scope.form.accountPassword
    form = $scope.form.current
    if form.$valid
      AccountService.updatePassword(type).then ->
        form.$setUntouched()
        form.$setPristine()

  $scope.$on 'auth:login-error', (ev, reason) ->
    if (reason.error == 'not_confirmed')
      AccountService.openConfirmEmailModal(reason.email)
    else
      # if (reason.error == 'bad_credentials')
      $scope.accountError.message = $translate.instant('SIGN_IN.BAD_CREDENTIALS')
      $scope.handleErrorState()

  $scope.updateEmail = ->
    $scope.form.current = $scope.form.accountEmail
    AccountService.updateAccount('email')

  $scope.updateNameDOB = ->
    $scope.form.current = $scope.form.accountNameDOB
    AccountService.updateAccount('nameDOB')

  $scope.isLocked = (field) ->
    AccountService.lockedFields[field]

  $scope.emailConfirmInstructions = ->
    $translate.instant('CREATE_ACCOUNT.EMAIL_CONFIRM_INSTRUCTIONS')

  $scope.confirmEmailSentMessage = ->
    interpolate = { email: $scope.createdAccount.email }
    $translate.instant('CONFIRM_ACCOUNT.EMAIL_HAS_BEEN_SENT_TO', interpolate)

  $scope.confirmEmailExpiredMessage = ->
    interpolate = { email: $scope.createdAccount.email }
    $translate.instant('CONFIRM_ACCOUNT.EXPIRED_EMAIL_SENT_TO', interpolate)

  $scope.resendConfirmationEmail = ->
    $scope.resendDisabled = true
    $scope.resentConfirmationMessage = null
    AccountService.resendConfirmationEmail().then( ->
      $scope.resendDisabled = false
      $scope.resentConfirmationMessage = $translate.instant('SIGN_IN.RESENT_CONFIRMATION_MESSAGE')
    ).catch( ->
      $scope.resendDisabled = false
    )

  $scope.hasApplications = ->
    return false if $scope.myApplications.length == 0
    # as long as we have some where !deleted
    _.some($scope.myApplications, {deleted: false})

  $scope._signInRedirect = ->
    if AccountService.loggedIn() && $scope._userInShortFormSession()
      # make sure short form data inherits logged in user data
      ShortFormApplicationService.importUserData(AccountService.loggedInUser)
      ShortFormApplicationService.submitApplication({draft: true}).then( ->
        $state.go('dahlia.my-account', {skipConfirm: true})
      )
    else if AccountService.loggedIn()
      if AccountService.loginRedirect
        AccountService.goToLoginRedirect()
      else
        $state.go('dahlia.my-account')

  $scope._createAccountRedirect = ->
    # send to sign in state if user created account from saving application
    if $scope._userInShortFormSession()
      # make sure short form data inherits created account user data
      ShortFormApplicationService.importUserData($scope.userDataForContact)
      ShortFormApplicationService.submitApplication(
        {draft: true, attachToAccount: true}
      ).then ->
        $state.go('dahlia.sign-in', {skipConfirm: true, newAccount: true})
    else
      $state.go('dahlia.sign-in', {newAccount: true})

  $scope._userInShortFormSession = ->
    shortFormCreateAccountPath = 'dahlia.short-form-application.create-account'
    shortFormSignInPath = 'dahlia.short-form-application.sign-in'
    $state.current.name == shortFormCreateAccountPath ||  $state.current.name == shortFormSignInPath

  $scope.clearCreatedAccount = ->
    angular.copy({}, $scope.createdAccount)

  $scope.informationChangeNotice = ->
    $translate.instant('ACCOUNT_SETTINGS.INFORMATION_CHANGE_NOTICE')

  $scope.displayChangeNotice = (attributesChanged) ->
    AccountService.clearAccountMessages()
    $scope[attributesChanged] = true

AccountController.$inject = ['$scope', '$state', '$document', '$translate', 'AccountService', 'ShortFormApplicationService']

angular
  .module('dahlia.controllers')
  .controller('AccountController', AccountController)
