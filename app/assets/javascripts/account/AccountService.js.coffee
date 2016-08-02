############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = ($state, $auth, $modal, $http, ShortFormApplicationService) ->
  Service = {}
  # userAuth is used as model for inputs in create-account form
  Service.userAuth = {}
  Service.loggedInUser = {}
  Service.myApplications = false
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
      .then((response) ->
        angular.copy(response.data.data, Service.createdAccount)
        angular.copy({}, Service.userAuth)
        Service.accountError.message = null
        return true
      ).catch((response) ->
        msg = response.data.errors.full_messages[0]
        if msg == 'Email already in use'
          Service.accountError.message = $translate.instant("ERROR.EMAIL_ALREADY_IN_USE")
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
      )

  Service.openConfirmEmailModal = (email) ->
    if email
      Service.createdAccount.email = email
    modalInstance = $modal.open({
      templateUrl: 'account/templates/partials/_confirm_email_modal.html',
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
    !_.isEmpty(Service.loggedInUser) && Service.loggedInUser.signedIn

  Service.newAccountConfirmEmailModal = ->
    if Service._accountJustCreated()
      Service.openConfirmEmailModal()

  Service._accountJustCreated = ->
    Service.createdAccount.email && !Service.createdAccount.confirmed_at

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
    return false if _.isEmpty(Service.loggedInUser) || typeof Service.loggedInUser != 'undefined'
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

  # run on page load
  Service.unlockFields()

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountService.$inject = ['$state', '$auth', '$modal', '$http', 'ShortFormApplicationService']

angular
  .module('dahlia.services')
  .service('AccountService', AccountService)
