############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = ($state, $auth) ->
  Service = {}
  # userAuth is used as model for inputs in create-account form
  Service.userAuth = {}
  Service.loggedInUser = {}
  Service.rememberedState = null

  Service.rememberState = (name, params) ->
    Service.rememberedState = name

  Service.createAccount = ->
    $auth.submitRegistration(Service.userAuth)
      .then((response) ->
        # handle success response
        alert('OK!')
        email = Service.userAuth.email
        password = Service.userAuth.password
        # reset userAuth object
        angular.copy({}, Service.userAuth)
        # $auth.submitLogin(email: email, password: password)
        #   .then((response) ->
        #     if response.signedIn
        #       angular.copy(response, Service.loggedInUser)
        #   )
      ).catch((response) ->
        # handle submitRegistration error response
        alert("Error: #{response.data.errors.full_messages[0]}")
      )

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
