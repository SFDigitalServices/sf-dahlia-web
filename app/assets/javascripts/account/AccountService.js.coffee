############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = ($state, $auth, $modal, $http, $translate, ShortFormApplicationService) ->
  Service = {}
  # userAuth is used as model for inputs in create-account form
  Service.userAuth = {}
  Service.loggedInUser = {}
  Service.myApplications = []
  Service.createdAccount = {}
  Service.rememberedShortFormState = null
  Service.accountError = {message: null}

  Service.rememberShortFormState = (name, params) ->
    Service.rememberedShortFormState = name

  Service.createAccount = (shortFormSession) ->
    Service._formatDOB()
    if shortFormSession
      Service.userAuth.temp_session_id = shortFormSession.uid + shortFormSession.userkey
    $auth.submitRegistration(Service.userAuth)
      .success((response) ->
        angular.copy(response.data, Service.createdAccount)
        angular.copy({}, Service.userAuth)
        Service.accountError.message = null
        return true
      ).error((response) ->
        msg = response.errors.full_messages[0]
        if msg == 'Email already in use'
          Service.accountError.message = $translate.instant("ERROR.EMAIL_ALREADY_IN_USE")
        else if msg == 'Salesforce contact can\'t be blank'
          Service.accountError.message = $translate.instant("ERROR.CREATE_ACCOUNT")
        else
          Service.accountError.message = msg
        return false
      )

  Service.signIn = ->
    $auth.submitLogin(Service.userAuth)
      .then((response) ->
        # reset userAuth object
        angular.copy({}, Service.userAuth)
        if response.signedIn
          angular.copy(response, Service.loggedInUser)
          Service._reformatDOB()
          ShortFormApplicationService.importUserData(Service.loggedInUser)
          return true
      ).catch((response) ->
        Service.accountError.message = response.errors[0]
        return false
      )

  Service.requestPasswordReset = ->
    Service.clearAccountErrorMessage()
    params =
      email: Service.userAuth.user.email
    $auth.requestPasswordReset(params).then((resp) ->
      Service.userAuth.user.resetPwdEmailSent = true
    ).catch (resp) ->
      Service.accountError.message = $translate.instant("ERROR.EMAIL_NOT_FOUND")
    return

  Service.updatePassword = ->
    Service.clearAccountErrorMessage()
    params =
      password: Service.userAuth.user.password
      password_confirmation: Service.userAuth.user.password_confirmation

    $auth.updatePassword(params).then((resp) ->
      $state.go('dahlia.my-applications')
    ).catch (resp) ->
      Service.accountError.message = $translate.instant("ERROR.PASSWORD_UPDATE")
    return

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

  Service._formatDOB = ->
    month = Service.userAuth.dob_month
    day = Service.userAuth.dob_day
    year = Service.userAuth.dob_year
    formattedDOB = year + '-' + month + '-' + day
    Service.userAuth.DOB = formattedDOB

  Service.signOut = ->
    $auth.signOut()
      .then((response) ->
        angular.copy({}, Service.loggedInUser)
      )

  # this gets run on init of the app in AngularConfig to check if we're logged in
  Service.validateUser = ->
    $auth.validateUser().then((response) ->
      # will only reach this state if user is logged in w/ a token
      angular.copy(response, Service.loggedInUser)
      Service._reformatDOB()
      ShortFormApplicationService.importUserData(Service.loggedInUser)
    )

  Service.loggedIn = ->
    return false if !Service.loggedInUser
    !_.isEmpty(Service.loggedInUser) && Service.loggedInUser.signedIn

  Service.resendConfirmationEmail = ->
    params =
      email: Service.createdAccount.email

    $http.post('/api/v1/auth/confirmation', params).then((data, status, headers, config) ->
      # $modal.close()
      data
    ).catch( (data, status, headers, config) ->
      return
    )

  Service.getMyApplications = ->
    $http.get('/api/v1/account/my-applications').success((data) ->
      if data.applications
        angular.copy(data.applications, Service.myApplications)
    )

  #################### helper functions
  Service._formatDOB = ->
    month = Service.userAuth.dob_month
    day = Service.userAuth.dob_day
    year = Service.userAuth.dob_year
    formattedDOB = year + '-' + month + '-' + day
    Service.userAuth.DOB = formattedDOB

  # reverse of the above function
  Service._reformatDOB = ->
    return false if !Service.loggedIn()
    split = Service.loggedInUser.DOB.split('-')
    Service.loggedInUser.dob_year = parseInt(split[0])
    Service.loggedInUser.dob_month = parseInt(split[1])
    Service.loggedInUser.dob_day = parseInt(split[2])

  Service.copyApplicantFields = ->
    applicant = _.pick ShortFormApplicationService.applicant,
      ['firstName', 'middleName', 'lastName', 'dob_day', 'dob_month', 'dob_year', 'email']
    angular.copy(applicant, Service.userAuth)

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

  Service.clearAccountErrorMessage = ->
    Service.accountError.message = null

  # run on page load
  Service.unlockFields()

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountService.$inject = [
  '$state', '$auth', '$modal', '$http', '$translate', 'ShortFormApplicationService'
]

angular
  .module('dahlia.services')
  .service('AccountService', AccountService)
