############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = ($state, $auth) ->
  Service = {}
  # userAuth is used as model for inputs in create-account form
  Service.userAuth = {}
  Service.loggedInUser = {}
  Service.rememberedShortFormState = null

  Service.rememberShortFormState = (name, params) ->
    Service.rememberedShortFormState = name

  Service.createAccount = (shortFormSession) ->
    Service._formatDOB()
    if shortFormSession
      Service.userAuth.temp_session_id = shortFormSession.uid + shortFormSession.userkey
    $auth.submitRegistration(Service.userAuth)
      .then((response) ->
        # handle success response
        alert('OK!')
        # reset userAuth object
        angular.copy({}, Service.userAuth)
        return true
      ).catch((response) ->
        # handle submitRegistration error response
        alert("Error: #{response.data.errors.full_messages[0]}")
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

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountService.$inject = ['$state', '$auth']

angular
  .module('dahlia.services')
  .service('AccountService', AccountService)
