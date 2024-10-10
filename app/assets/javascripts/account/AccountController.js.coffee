AccountController = (
  $document,
  $scope,
  $state,
  $translate,
  AccountService,
  AnalyticsService,
  inputMaxLength,
  ListingIdentityService,
  ModalService,
  SharedService,
  ShortFormApplicationService
) ->
  $scope.rememberedShortFormState = AccountService.rememberedShortFormState
  $scope.showChooseDiffEmailMessage = AccountService.showChooseDiffEmailMessage
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
  $scope.INPUT_MAX_LENGTH = inputMaxLength

  $scope.passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(.+){8,}$/
  $scope.emailRegex = SharedService.emailRegex

  $scope.accountForm = ->
    # pick up which ever one is defined (the other will be undefined)
    $scope.form.signIn ||
    $scope.form.createAccount ||
    $scope.form.updatePassword ||
    $scope.form.passwordReset ||
    $scope.form.current

  $scope.closeModal = ->
    ModalService.closeModal()

  $scope.closeAlert = ->
    $scope.closeModal()
    $scope.hideAlert = true

  $scope.handleErrorState = ->
    if !$scope.accountError.messages.user
      $scope.accountError.messages.user = $translate.instant('error.form_submission')
    # show error alert
    $scope.hideAlert = false
    el = angular.element(document.getElementById('form-wrapper'))
    # uses duScroll aka 'angular-scroll' module
    topOffset = 0
    duration = 400 # animation speed in ms
    $document.scrollToElement(el, topOffset, duration)

  $scope.inputInvalid = (fieldName, identifier = '', form = null) ->
    if !form
      form = $scope.accountForm()
    return false unless form
    fieldName = if identifier then "#{identifier}_#{fieldName}" else fieldName
    field = form[fieldName]
    if form && field
      field.$invalid && (field.$touched || form.$submitted)
    else
      false

  $scope.createAccount = ->
    form = $scope.accountForm()
    if form.$valid
      AnalyticsService.trackFormSuccess('Accounts')
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
      AnalyticsService.trackFormError('Accounts')
      $scope.handleErrorState()

  $scope.signIn = ->
    form = $scope.accountForm()
    if form.$valid
      AnalyticsService.trackFormSuccess('Accounts')
      $scope.submitDisabled = true
      # AccountService.userAuth will have been modified by form inputs
      AccountService.signIn().then( (success) ->
        $scope.submitDisabled = false
        if success
          form.$setUntouched()
          form.$setPristine()

          # if user hasn't started the application at all and signs in from welcome page
          if $state.params.fromShortFormIntro
            $state.go('dahlia.short-form-welcome.intro', {id: ShortFormApplicationService.listing.Id})
          else if $state.current.name == 'dahlia.continue-draft-sign-in'
            $state.go('dahlia.short-form-application.name', id: $state.params.listing_id)
          else
            $scope._signInRedirect()
      ).catch( error ->
      if (error.message == 'transition prevented')
        ### TODO:
          If the user is navigating from an Angular Sign In page to a React my account page,
          the ui-router will prevent the transition and force routing via Rails.
          Preventing the transition causes the ui-router to throw an error, which we catch here.
          Setting the timeout allows the Rails routing system time to catch up and
          route the user to the React My Account page without throwing an error.
          This is a temporary solution until we can launch the re-written Sign In page.
        ###
        setTimeout (-> $scope.handleErrorState()), 1000
      else
        $scope.handleErrorState()
        $scope.submitDisabled = false
      )
    else
      AnalyticsService.trackFormError('Accounts')
      $scope.handleErrorState()

  $scope.requestPasswordReset = ->
    form = $scope.form.passwordReset
    if form.$valid
      AnalyticsService.trackFormSuccess('Accounts')
      $scope.submitDisabled = true
      AccountService.requestPasswordReset().then( (success) ->
        $scope.submitDisabled = false
      )
    else
      AnalyticsService.trackFormError('Accounts')
      $scope.handleErrorState()

  $scope.$on 'auth:login-error', (ev, reason) ->
    if (reason.error == 'not_confirmed')
      AccountService.openConfirmEmailModal(reason.email)
    else
      $scope.accountError.messages.user = $translate.instant('sign_in.bad_credentials')
      $scope.handleErrorState()

  $scope.updatePassword = (type) ->
    $scope.form.current = $scope.form.accountPassword
    form = $scope.form.current
    if form.$valid
      $scope.submitDisabled = true
      AccountService.updatePassword(type).then ->
        $scope.submitDisabled = false
        form.$setUntouched()
        form.$setPristine()

  $scope.updateEmail = ->
    $scope.form.current = $scope.form.accountEmail
    if $scope.form.current.$valid
      $scope.submitDisabled = true
      AccountService.updateAccount('email').then( ->
        $scope.submitDisabled = false
      )

  $scope.updateNameDOB = ->
    $scope.form.current = $scope.form.accountNameDOB
    if $scope.form.current.$valid
      $scope.submitDisabled = true
      AccountService.updateAccount('nameDOB').then( ->
        $scope.submitDisabled = false
      )

  $scope.isLocked = (field) ->
    AccountService.lockedFields[field]

  $scope.emailConfirmInstructions = ->
    $translate.instant('create_account.email_confirm_instructions')

  $scope.confirmEmailSentMessage = ->
    interpolate = { email: $scope.createdAccount.email }
    $translate.instant('confirm_account.email_has_been_sent_to', interpolate)

  $scope.confirmEmailExpiredMessage = ->
    interpolate = { email: $scope.createdAccount.email }
    $translate.instant('confirm_account.expired_email_sent_to', interpolate)

  $scope.chooseDifferentEmailMessage = ->
    $translate.instant('create_account.choose_diff_email')

  $scope.mustBeOver18Message = ->
    $translate.instant('create_account.must_be_over_18')

  $scope.resendConfirmationEmail = ->
    $scope.resendDisabled = true
    $scope.resentConfirmationMessage = null
    AccountService.resendConfirmationEmail().then( ->
      $scope.resendDisabled = false
      $scope.resentConfirmationMessage = $translate.instant('sign_in.resent_confirmation_message')
    ).catch( ->
      $scope.resendDisabled = false
    )

  $scope.hasApplications = ->
    return false if $scope.myApplications.length == 0
    # as long as we have some where !deleted
    _.some($scope.myApplications, {deleted: false})

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
    $state.current.name.indexOf('dahlia.short-form-application') > -1

  $scope.clearCreatedAccount = ->
    angular.copy({}, $scope.createdAccount)

  $scope.informationChangeNotice = ->
    $translate.instant('account_settings.information_change_notice')

  $scope.displayChangeNotice = (attributesChanged) ->
    AccountService.clearAccountMessages()
    $scope[attributesChanged] = true

  $scope.dahliaContactEmail = ->
    { email: '<a href="mailto:dahliahousingportal@sfgov.org">dahliahousingportal@sfgov.org</a>' }

  $scope.DOBValid = (field, value) ->
    values =
      month: parseInt($scope.userAuth.contact.dob_month)
      day: parseInt($scope.userAuth.contact.dob_day)
      year: parseInt($scope.userAuth.contact.dob_year)
    values[field] = parseInt(value)
    ShortFormApplicationService.DOBValid(field, values)

  $scope.DOBUnder18 = (formName = '') ->
    if formName
      form = $scope.form[formName]
    else
      form = $scope.accountForm()
    year = form['date_of_birth_year'].$viewValue
    month = form['date_of_birth_month'].$viewValue
    day = form['date_of_birth_day'].$viewValue
    AccountService.DOBUnder18(year, month, day)

  $scope.recheckDOB = (formName = '') ->
    if formName
      form = $scope.form[formName]
    else
      form = $scope.accountForm()
    # have to "reset" the day, month, and year form input by setting it to
    # its current value which will auto-trigger its ui-validation
    year = form['date_of_birth_year']
    year.$setViewValue(year.$viewValue + ' ')
    month = form['date_of_birth_month']
    month.$setViewValue(month.$viewValue + ' ')
    day = form['date_of_birth_day']
    day.$setViewValue(day.$viewValue + ' ')

  $scope.DOBHasError = (form = null) ->
    $scope.inputInvalid('date_of_birth_day', '', form) ||
    $scope.inputInvalid('date_of_birth_month', '', form) ||
    $scope.inputInvalid('date_of_birth_year', '', form)

  $scope.isRental = (listing) ->
    ListingIdentityService.isRental(listing)

  $scope.isSale = (listing) ->
    ListingIdentityService.isSale(listing)

  $scope.hasSaleAndRentalApplications = (applications) ->
    activeApplications = _.filter applications, (application) ->
      !application.deleted
    if _.first(activeApplications)
      firstIsSale = ListingIdentityService.isSale(_.first(activeApplications).listing)
      # Check if any other application listing is different type than the first one
      _.some activeApplications, (application) ->
        ListingIdentityService.isSale(application.listing) != firstIsSale
    else
      false

  $scope.validatePasswordConfirmationMatch = (value) ->
    value == $scope.userAuth.user.password

  $scope.passwordConfirmationError = () ->
    if _.isEmpty($scope.userAuth.user.password_confirmation)
      $translate.instant('label.field_required')
    else
      $translate.instant('error.password_confirmation')

AccountController.$inject = [
  '$document', '$scope', '$state', '$translate', 'AccountService', 'AnalyticsService', 'inputMaxLength',
  'ListingIdentityService', 'ModalService', 'SharedService', 'ShortFormApplicationService'
]

angular
  .module('dahlia.controllers')
  .controller('AccountController', AccountController)
