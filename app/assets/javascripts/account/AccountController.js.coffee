AccountController = ($scope, $state, $document, $translate, AccountService, ShortFormApplicationService) ->
  $scope.rememberedShortFormState = AccountService.rememberedShortFormState
  $scope.form = { current: {} }
  # userAuth is used as model for inputs in create-account form
  $scope.userAuth = AccountService.userAuth
  $scope.myApplications = AccountService.myApplications
  $scope.createdAccount = AccountService.createdAccount
  $scope.currentApplication = AccountService.currentApplication
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

  $scope.closeAlert = ->
    $scope.hideAlert = true

  $scope.handleErrorState = ->
    if !$scope.accountError.messages.user
      $scope.accountError.messages.user = $translate.instant('ERROR.FORM_SUBMISSION')
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
      $scope.accountError.messages.user = null
      $scope.submitDisabled = true
      # AccountService.userAuth will have been modified by form inputs
      shortFormSession = null
      if $scope.userInShortFormSession()
        shortFormSession =
          uid: ShortFormApplicationService.session_uid
      $scope.userDataForContact = AccountService.userDataForContact()
      AccountService.createAccount(shortFormSession).then( (success) ->
        if success
          form.$setUntouched()
          form.$setPristine()
          if $scope.userInShortFormSession()
            $scope._createAccountSubmitApplication()
          else
            $state.go('dahlia.sign-in', {newAccount: true})
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
          if $scope.userInShortFormSession()
            $scope._signInSubmitApplication()
          else
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
      $scope.accountError.messages.user = $translate.instant('SIGN_IN.BAD_CREDENTIALS')
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

  $scope._signInSubmitApplication = ->
    # check if this user has already applied to this listing
    ShortFormApplicationService.getMyAccountApplication().success((data) ->
      if !_.isEmpty(data.application) && $scope._previousIsSubmittedOrBothDrafts(data.application)
        # if user already had an application for this listing
        return $scope._signInAndSkipSubmit(data.application)
      changed = null
      opts = {}
      if ShortFormApplicationService.application.status.match(/draft/i)
        # make sure short form data inherits logged in user data
        changed = ShortFormApplicationService.importUserData(AccountService.loggedInUser)
      else
        # we're signing in to claim a submitted application
        opts = {attachToAccount: true}
      ShortFormApplicationService.submitApplication(opts).then( ->
        $state.go('dahlia.my-applications', {skipConfirm: true, infoChanged: changed})
      )
    ).error( ->
      # there was an error retrieving your account info, please try again
      # TODO: add some helpful message to the user
      $state.go('dahlia.short-form-application.name', {id: ShortFormApplicationService.listing.Id})
    )

  $scope._signInAndSkipSubmit = (previousApplication) ->
    if (previousApplication.status.match(/submitted/i))
      # they've already submitted -- send them to "my applications", either with:
      # - alreadySubmitted: "Good news! You already submitted" (if they were trying to save a draft)
      # - doubleSubmit: "You have already submitted to this account" (if they were trying to submit again)
      doubleSubmit = !! ShortFormApplicationService.application.status.match(/submitted/i)
      $state.go('dahlia.my-applications', {skipConfirm: true, alreadySubmittedId: previousApplication.id, doubleSubmit: doubleSubmit})
    else
      # send them to choose which draft they want to keep
      $state.go('dahlia.short-form-application.choose-draft')

  $scope._previousIsSubmittedOrBothDrafts = (previousApplication) ->
    previousApplication.status.match(/submitted/i) || (
      previousApplication.status.match(/draft/i) &&
      ShortFormApplicationService.application.status.match(/draft/i)
    )

  $scope._signInRedirect = ->
    return false unless AccountService.loggedIn()
    if AccountService.loginRedirect
      AccountService.goToLoginRedirect()
    else
      $state.go('dahlia.my-account')

  $scope._createAccountSubmitApplication = ->
    # make sure short form data inherits created account user data
    ShortFormApplicationService.importUserData($scope.userDataForContact)
    ShortFormApplicationService.submitApplication({attachToAccount: true}).then ->
      # send to sign in state if user created account from saving application
      $state.go('dahlia.sign-in', {skipConfirm: true, newAccount: true})

  $scope.userInShortFormSession = ->
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

  $scope.dahliaContactEmail = ->
    { email: '<a href="mailto:dahliahousingportal@sfgov.org">dahliahousingportal@sfgov.org</a>' }

AccountController.$inject = ['$scope', '$state', '$document', '$translate', 'AccountService', 'ShortFormApplicationService']

angular
  .module('dahlia.controllers')
  .controller('AccountController', AccountController)
