############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = (
  $state,
  $auth,
  $modal,
  $http,
  $translate,
  bsLoadingOverlayService,
  ShortFormApplicationService,
  ShortFormDataService
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
  Service.accountExists = false
  Service.rememberedShortFormState = null
  Service.accountError =
    messages: {}
  Service.accountSuccess =
    messages: {}
  Service.loginRedirect = null

  Service.rememberShortFormState = (name, params) ->
    Service.rememberedShortFormState = name

  Service.loggedIn = ->
    return false if !Service.loggedInUser
    !_.isEmpty(Service.loggedInUser) && Service.loggedInUser.signedIn

  Service.setLoggedInUser = (data) ->
    angular.copy(data, Service.loggedInUser)

  Service.importApplicantData = (applicant) ->
    fields = [
      'email', 'firstName', 'middleName', 'lastName', 'dob_day', 'dob_year', 'dob_month'
    ]
    # copy over all non-blank values e.g. omit middleName if null
    userData = _.omitBy(_.pick(applicant, fields), _.isNil)
    # merge the data into loggedInUser
    _.merge Service.loggedInUser, userData


  Service.createAccount = (shortFormSession) ->
    # loading overlay will be cleared on success by a state transition in the controller
    bsLoadingOverlayService.start()
    Service.clearAccountMessages()
    if shortFormSession
      Service.userAuth.user.temp_session_id = shortFormSession.uid
    $auth.submitRegistration(Service._createAccountParams())
      .success((response) ->
        angular.copy(response.data, Service.createdAccount)
        angular.copy(Service.userAuthDefaults, Service.userAuth)
        Service.clearAccountMessages()
        return true
      ).error((response) ->
        # for errors we manually stop the loading overlay
        bsLoadingOverlayService.stop()
        msg = response.errors.full_messages[0]
        if msg == 'Email already in use'
          Service.accountError.messages.user = $translate.instant("ERROR.EMAIL_ALREADY_IN_USE")
        else if msg == 'Salesforce contact can\'t be blank'
          Service.accountError.messages.user = $translate.instant("ERROR.CREATE_ACCOUNT")
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
          Service.setLoggedInUser(response)
          Service._reformatDOB()
          return true
      ).catch((response) ->
        # for errors we manually stop the loading overlay
        bsLoadingOverlayService.stop()
        return false
      )

  Service.requestPasswordReset = ->
    Service.clearAccountMessages()
    params =
      email: Service.userAuth.user.email
    $auth.requestPasswordReset(params).then((resp) ->
      Service.userAuth.user.resetPwdEmailSent = true
    ).catch (resp) ->
      Service.accountError.messages.user = $translate.instant("ERROR.EMAIL_NOT_FOUND")

  Service.updatePassword = (type) ->
    Service.clearAccountMessages()
    params =
      password: Service.userAuth.user.password
      password_confirmation: Service.userAuth.user.password_confirmation
    if type == 'change'
      params.current_password = Service.userAuth.user.current_password
    $auth.updatePassword(params).then((resp) ->
      Service.userAuth.user.current_password = ''
      Service.userAuth.user.password = ''
      Service.userAuth.user.password_confirmation = ''
      if type == 'change'
        msg = $translate.instant('ACCOUNT_SETTINGS.ACCOUNT_CHANGES_SAVED')
        Service.accountSuccess.messages.password = msg
        $state.go('dahlia.account-settings')
      else
        $state.go('dahlia.my-applications')
    ).catch (response) ->
      response = response.data if response.data
      msg = response.errors.full_messages[0]
      if msg == 'Current password is invalid'
        msg = $translate.instant("ERROR.CURRENT_PASSWORD_INVALID")
      else
        msg = $translate.instant("ERROR.PASSWORD_UPDATE")
      Service.accountError.messages.password = msg

  Service.checkForAccount = (email) ->
    $http.get("/api/v1/account/check-account?email=#{encodeURIComponent(email)}").success((data) ->
      Service.accountExists = data.account_exists
    ).catch( (data, status, headers, config) ->
      Service.accountExists = false
    )

  Service.shortFormAccountExists = ->
    Service.accountExists

  Service.signOut = ->
    # reset the user data immediately, then call signOut
    Service.setLoggedInUser({})
    ShortFormApplicationService.resetUserData()
    $auth.signOut()

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

    $http.post('/api/v1/auth/confirmation', params).then((data, status, headers, config) ->
      data
    ).catch( (data, status, headers, config) ->
      return
    )

  Service.getMyApplications = ->
    $http.get('/api/v1/account/my-applications').success((data) ->
      if data.applications
        angular.copy(data.applications, Service.myApplications)
    )

  Service.updateAccount = (infoType) ->
    bsLoadingOverlayService.start()
    # have to later manually call overlay.stop() since this update doesn't result in a stateChange
    Service.clearAccountMessages()
    if infoType == 'email'
      params =
        user:
          email: Service.userAuth.user.email
      $http.put('/api/v1/auth', params).success((data) ->
        bsLoadingOverlayService.stop()
        Service.accountSuccess.messages.email = $translate.instant("ACCOUNT_SETTINGS.VERIFY_EMAIL")
      ).error((response) ->
        bsLoadingOverlayService.stop()
        msg = response.errors.full_messages[0]
        if msg == 'Email has already been taken'
          Service.accountError.messages.email = $translate.instant("ERROR.EMAIL_ALREADY_IN_USE")
        else
          Service.accountError.messages.email = msg
      )
    else
      params =
        contact: Service.userDataForSalesforce()
      $http.put('/api/v1/account/update', params).success((data) ->
        bsLoadingOverlayService.stop()
        Service.accountSuccess.messages.nameDOB = $translate.instant("ACCOUNT_SETTINGS.ACCOUNT_CHANGES_SAVED")
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
    modalInstance = $modal.open({
      templateUrl: 'account/templates/partials/_confirm_email_modal.html',
      controller: 'ModalInstanceController',
      windowClass: 'modal-large'
    })

  Service.openConfirmationExpiredModal = (email, confirmed = false) ->
    Service.createdAccount.confirmed = confirmed
    if email
      Service.createdAccount.email = email
    modalInstance = $modal.open({
      templateUrl: 'account/templates/partials/_confirmation_expired_modal.html',
      controller: 'ModalInstanceController',
      windowClass: 'modal-large'
    })

  Service.openInfoChangedModal = () ->
    modalInstance = $modal.open({
      templateUrl: 'account/templates/partials/_info_changed_modal.html',
      controller: 'ModalInstanceController',
      windowClass: 'modal-large'
    })

  Service.openAlreadySubmittedModal = (application_id, doubleSubmit = false) ->
    currentApplication = _.find(Service.myApplications, {id: application_id})
    angular.copy(currentApplication, Service.currentApplication)
    templateUrl = 'account/templates/partials/_already_submitted.html'
    if doubleSubmit
      templateUrl = 'account/templates/partials/_double_submitted.html'
    modalInstance = $modal.open({
      templateUrl: templateUrl,
      controller: 'ModalInstanceController',
      windowClass: 'modal-large'
    })

  #################### helper functions
  Service.showReconfirmedMessage = ->
    Service.accountSuccess.messages.email = $translate.instant("ACCOUNT_SETTINGS.EMAIL_RECONFIRMED_UPDATED")

  Service.userDataForContact = ->
    _.merge({}, Service.userAuth.contact, {email: Service.userAuth.user.email})

  Service.userDataForSalesforce = ->
    contact = Service.userDataForContact()
    contact.DOB = ShortFormDataService.formatUserDOB(contact)
    contact = ShortFormDataService.removeDOBFields(contact)
    contact

  Service._createAccountParams = ->
    return {
      user: _.omit(Service.userAuth.user, ['email_confirmation'])
      contact: Service.userDataForSalesforce()
    }

  Service._reformatDOB = ->
    return false if !Service.loggedIn()
    _.merge(Service.loggedInUser, ShortFormDataService.reformatDOB(Service.loggedInUser.DOB))

  Service.copyApplicantFields = (from = 'applicant')->
    if from == 'applicant'
      user = ShortFormApplicationService.applicant
    else
      user = Service.loggedInUser
    contactInfo = _.pick user,
      ['firstName', 'middleName', 'lastName', 'dob_day', 'dob_month', 'dob_year']
    userInfo = _.pick user, ['email']
    angular.copy(contactInfo, Service.userAuth.contact)
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
    Service.accountSuccess.messages.redirect = $translate.instant('SIGN_IN.SIGN_IN_REQUIRED')
    Service.loginRedirect = path

  Service.goToLoginRedirect = ->
    $state.go(Service.loginRedirect)
    Service.loginRedirect = null

  Service.DOBValid = ShortFormDataService.DOBValid

  # run on page load
  Service.unlockFields()

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountService.$inject = [
  '$state', '$auth', '$modal', '$http', '$translate', 'bsLoadingOverlayService'
  'ShortFormApplicationService', 'ShortFormDataService'
]

angular
  .module('dahlia.services')
  .service('AccountService', AccountService)
