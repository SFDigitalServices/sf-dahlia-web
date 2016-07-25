############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = ($state, $auth, $modal, $http) ->
  Service = {}
  # userAuth is used as model for inputs in create-account form
  Service.userAuth = {}
  Service.loggedInUser = {}
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
        Service.accountError.message = response.data.errors.full_messages[0]
        return false
      )

  Service.signIn = ->
    $auth.submitLogin(Service.userAuth)
      .then((response) ->
        if response.signedIn
          angular.copy(response, Service.loggedInUser)
      ).catch((response) ->
        alert("Error: #{response.errors[0]}")
      )

  Service._openConfirmEmailModal = ->
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

  # this runs on init of the app to check if we're logged upon arrival
  Service.validateUser = ->
    $auth.validateUser().then((response) ->
      # will only reach this state if user is logged in w/ a token
      angular.copy(response, Service.loggedInUser)
    )

  Service.loggedIn = ->
    !_.isEmpty(Service.loggedInUser) && Service.loggedInUser.signedIn

  Service.newAccountConfirmEmailModal = ->
    if Service._accountJustCreated()
      Service._openConfirmEmailModal()

  Service._accountJustCreated = ->
    Service.createdAccount.email && !Service.createdAccount.confirmed_at

  Service.resendConfirmationEmail = ->
    params =
      email: Service.createdAccount.email

    # TO DO: Write create controller method in rails endpoint
    $http.post("api/v1/auth/confirmation", params).success((data, status, headers, config) ->
      data
    ).error( (data, status, headers, config) ->
      return
    )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountService.$inject = ['$state', '$auth', '$modal', '$http']

angular
  .module('dahlia.services')
  .service('AccountService', AccountService)
