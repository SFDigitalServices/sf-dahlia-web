############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = (
  $state,
  $auth,
  $http,
  $translate,
  $window,
  bsLoadingOverlayService,
  ShortFormApplicationService,
  ShortFormDataService,
  ModalService,
  AnalyticsService
) ->
  Service = {}
  # userAuth is used as model for inputs in create-account form
  Service.userAuthDefaults =
    user: {}
    contact: {}
  Service.userAuth = angular.copy(Service.userAuthDefaults)
  Service.loggedInUser = {}
  Service.myApplications = []
  Service.currentApplication = {}
  Service.createdAccount = {}
  Service.rememberedShortFormState = null
  Service.accountError =
    messages: {}
  Service.accountSuccess =
    messages: {}
  Service.loginRedirect = null
  Service.accountExists = false

  Service.rememberShortFormState = (name) ->
    Service.rememberedShortFormState = name

  Service.showChooseDiffEmailMessage = false

  Service.loggedIn = ->
    return false if !Service.loggedInUser
    !_.isEmpty(Service.loggedInUser) && Service.loggedInUser.signedIn

  Service.setLoggedInUser = (data) ->
    if _.isEmpty(data)
      # clear userContext
      Raven.setUserContext()
    else
      Raven.setUserContext({
        email: data.email,
        id: data.id
      })
    angular.copy(data, Service.loggedInUser)

  Service.createAccount = (shortFormSession) ->
    # loading overlay will be cleared on success by a state transition in the controller
    bsLoadingOverlayService.start()
    Service.clearAccountMessages()
    if shortFormSession
      Service.userAuth.user.temp_session_id = shortFormSession.uid
    $auth.submitRegistration(Service.createAccountParams())
      .success((response) ->
        angular.copy(response.data, Service.createdAccount)
        angular.copy(Service.userAuthDefaults, Service.userAuth)
        Service.clearAccountMessages()
        return true
      ).error((response) ->
        # for errors we manually stop the loading overlay
        bsLoadingOverlayService.stop()
        msg = response.errors.full_messages[0]
        if msg == 'Email has already been taken'
          Service.accountError.messages.user = $translate.instant("error.email_already_in_use")
        else if msg == 'Salesforce contact can\'t be blank'
          Service.accountError.messages.user = $translate.instant("error.create_account")
        else
          Service.accountError.messages.user = msg
        return false
      )

  Service.signIn = ->
    # loading overlay will be cleared on success by a state transition in the controller
    bsLoadingOverlayService.start()
    Service.clearAccountMessages()
    $auth.submitLogin(Service.userAuth.user)
      .then((response) ->
        # reset userAuth object
        angular.copy(Service.userAuthDefaults, Service.userAuth)
        if response.signedIn
          AnalyticsService.trackEvent('login_succeeded', { origin: 'Application Sign In', user_id: response.id })
          Service.setLoggedInUser(response)
          Service._reformatDOB()
          return true
      ).catch((response) ->
        # for errors we manually stop the loading overlay
        AnalyticsService.trackEvent("login_failed", {
            user_id: null,
            origin: 'Application Sign In',
            error_reason: response?.reason || undefined,
          })
        bsLoadingOverlayService.stop()
        return false
      )

  Service.requestPasswordReset = ->
    Service.clearAccountMessages()
    params =
      email: Service.userAuth.user.email
      locale: $translate.use()
    $auth.requestPasswordReset(params).then((resp) ->
      Service.userAuth.user.resetPwdEmailSent = true
    ).catch (resp) ->
      Service.accountError.messages.user = $translate.instant("error.email_not_found")

  Service.updatePassword = (type) ->
    Service.clearAccountMessages()
    params =
      password: Service.userAuth.user.password
      password_confirmation: Service.userAuth.user.password_confirmation
      locale: $translate.use()
    if type == 'change'
      params.current_password = Service.userAuth.user.current_password
    $auth.updatePassword(params).then((resp) ->
      Service.userAuth.user.current_password = ''
      Service.userAuth.user.password = ''
      Service.userAuth.user.password_confirmation = ''
      if type == 'change'
        msg = $translate.instant('account_settings.account_changes_saved')
        Service.accountSuccess.messages.password = msg
        $state.go('dahlia.account-settings')
      else
        $state.go('dahlia.my-applications')
    ).catch (response) ->
      response = response.data if response.data
      if $window.env.ACCOUNT_INFORMATION_PAGES_REACT == "false"
        msg = response.errors.full_messages[0]
        if msg == 'Current password is invalid'
          msg = $translate.instant("error.current_password_invalid")
        else
          msg = $translate.instant("error.password_update")
      Service.accountError.messages.password = msg

  Service.checkForAccount = (email) ->
    $http.get("/api/v1/account/check-account?email=#{encodeURIComponent(email)}").success((data) ->
      Service.accountExists = data.account_exists
    ).catch( (data, status, headers, config) ->
      Service.accountExists = false
    )

  Service.shortFormAccountExists = ->
    Service.accountExists

  Service.signOut = (opts = {}) ->
    # reset the user data immediately, then call signOut
    Service.setLoggedInUser({})
    ShortFormApplicationService.resetApplicationData() unless opts.preserveAppData
    AnalyticsService.trackEvent('logout', {reason: "Angular logout"})
    $auth.signOut()
    # close any open modal, e.g. "Lottery Results" that may have been opened while
    # you were on My Applications
    ModalService.closeModal()

  # this gets run on init of the app in AngularConfig to check if we're logged in
  Service.validateUser = ->
    $auth.validateUser().then((response) ->
      # will only reach this state if user is logged in w/ a token
      Service.setLoggedInUser(response)
      Service._reformatDOB()
      ShortFormApplicationService.importUserData(Service.loggedInUser)
    )

  Service.resendConfirmationEmail = ->
    params =
      email: Service.createdAccount.email
      locale: $translate.use()

    $http.post('/api/v1/auth/confirmation', params).then((data, status, headers, config) ->
      data
    ).catch( (data, status, headers, config) ->
      return
    )

  Service.getMyApplications = ->
    $http.get('/api/v1/account/my-applications').success((data) ->
      if data.applications
        myApplications = _.map(data.applications, ShortFormDataService.reformatApplication)
        angular.copy(myApplications, Service.myApplications)
    )

  Service.updateAccount = (infoType) ->
    Service.clearAccountMessages()
    params =
      locale: $translate.use()
    if infoType == 'email'
      params.user =
        email: Service.userAuth.user.email
      $http.put('/api/v1/auth', params).success((data) ->
        Service.accountSuccess.messages.email = $translate.instant("account_settings.verify_email")
      ).error((response) ->
        msg = response.errors.full_messages[0]
        if msg == 'Email has already been taken'
          Service.accountError.messages.email = $translate.instant("error.email_already_in_use")
        else
          Service.accountError.messages.email = msg
      )
    else
      params.contact =
        Service.userDataForSalesforce()
      $http.put('/api/v1/account/update', params).success((data) ->
        Service.accountSuccess.messages.nameDOB = $translate.instant("account_settings.account_changes_saved")
        _.merge(Service.loggedInUser, data.contact)
        Service._reformatDOB()
      ).error((response) ->
        # currently, shouldn't ever really reach this case
        bsLoadingOverlayService.stop()
        msg = response.errors.full_messages[0]
        Service.accountError.messages.email = msg
      )

  #################### modals
  Service.openConfirmEmailModal = (email) ->
    if email
      Service.createdAccount.email = email
    ModalService.openModal('account/templates/partials/_confirm_email_modal.html')

  Service.openConfirmationExpiredModal = (email, confirmed = false) ->
    Service.createdAccount.confirmed = confirmed
    if email
      Service.createdAccount.email = email
    ModalService.openModal('account/templates/partials/_confirmation_expired_modal.html')

  Service.openInfoChangedModal = () ->
    ModalService.openModal('account/templates/partials/_info_changed_modal.html')

  Service.openAlreadySubmittedModal = (application_id, doubleSubmit = false) ->
    currentApplication = _.find(Service.myApplications, {id: application_id})
    angular.copy(currentApplication, Service.currentApplication)
    templateUrl = 'account/templates/partials/_already_submitted.html'
    if doubleSubmit
      templateUrl = 'account/templates/partials/_double_submitted.html'
    ModalService.openModal(templateUrl)

  #################### helper functions
  Service.showReconfirmedMessage = ->
    Service.accountSuccess.messages.email = $translate.instant("account_settings.email_reconfirmed_updated")

  Service.userDataForContact = ->
    _.merge({}, Service.userAuth.contact, {email: Service.userAuth.user.email})

  Service.userDataForSalesforce = ->
    contact = Service.userDataForContact()
    contactWithDOB = _.merge({}, contact, {'DOB': ShortFormDataService.formatUserDOB(contact)})
    ShortFormDataService.removeDOBFields(contactWithDOB)

  Service.createAccountParams = ->
    return {
      user: _.omit(Service.userAuth.user, ['email_confirmation'])
      contact: Service.userDataForSalesforce()
      locale: $translate.use()
    }

  Service._reformatDOB = ->
    return false if !Service.loggedIn()
    _.merge(Service.loggedInUser, ShortFormDataService.reformatDOB(Service.loggedInUser.DOB))

  Service.copyApplicantFields = (from = 'applicant', opts = {}) ->
    if from == 'applicant'
      user = ShortFormApplicationService.applicant
    else
      user = Service.loggedInUser

    contactInfo = _.pick user,
      ['firstName', 'middleName', 'lastName', 'dob_day', 'dob_month', 'dob_year']
    angular.copy(contactInfo, Service.userAuth.contact)

    unless opts.excludeEmail
      userInfo = _.pick user, ['email']
      angular.copy(userInfo, Service.userAuth.user)

  Service.lockCompletedFields = ->
    a = ShortFormApplicationService.applicant
    Service.lockedFields =
      name: !! (a.firstName && a.lastName)
      dob: !! (a.dob_day && a.dob_month && a.dob_year)
      email: !! a.email

  Service.unlockFields = ->
    Service.lockedFields =
      name: false
      dob: false
      email: false

  Service.clearAccountMessages = ->
    Service.accountError.messages = {}
    Service.accountSuccess.messages = {}

  Service.resetUserAuth = ->
    angular.copy(Service.userAuthDefaults, Service.userAuth)

  Service.afterLoginRedirect = (path) ->
    Service.accountSuccess.messages.redirect = $translate.instant('sign_in.sign_in_required')
    Service.loginRedirect = path

  Service.goToLoginRedirect = ->
    $state.go(Service.loginRedirect)
    Service.loginRedirect = null

  Service.afterSignOut = ->
    Service.accountSuccess.messages.signedOut = $translate.instant('sign_in.signed_out_successfully')

  Service.afterUserTokenValidationTimeout = ->
    Service.accountSuccess.messages.userTokenValidationTimeout = $translate.instant('sign_in.user_token_validation_timeout')

  Service.DOBValid = ShortFormDataService.DOBValid

  Service.DOBUnder18 = (year, month, day) ->
    dob = ShortFormDataService.DOBtoMoment(year, month, day)
    age = ShortFormDataService.DOBtoAge(dob)
    return unless age
    age < 18

  # run on page load
  Service.unlockFields()

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountService.$inject = [
  '$state', '$auth', '$http', '$translate', '$window', 'bsLoadingOverlayService'
  'ShortFormApplicationService', 'ShortFormDataService', 'ModalService', 'AnalyticsService'
]

angular
  .module('dahlia.services')
  .service('AccountService', AccountService)
