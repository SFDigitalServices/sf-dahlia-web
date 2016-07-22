############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = ($state, $auth, ShortFormApplicationService) ->
  Service = {}
  # userAuth is used as model for inputs in create-account form
  Service.userAuth = {}
  Service.loggedInUser = {}
  Service.rememberedState = null

  Service.rememberState = (name, params) ->
    Service.rememberedState = name

  #################### $auth functions
  Service.createAccount = ->
    Service._formatDOB()
    $auth.submitRegistration(Service.userAuth)
      .then((response) ->
        # handle success response
        alert('OK!')
        # reset userAuth object
        angular.copy({}, Service.userAuth)
      ).catch((response) ->
        # handle submitRegistration error response
        alert("Error: #{response.data.errors.full_messages[0]}")
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
      ).catch((response) ->
        alert("Error: #{response.errors[0]}")
      )

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

  #################### helper functions
  Service._formatDOB = ->
    month = Service.userAuth.dob_month
    day = Service.userAuth.dob_day
    year = Service.userAuth.dob_year
    formattedDOB = year + '-' + month + '-' + day
    Service.userAuth.DOB = formattedDOB

  # reverse of the above function
  Service._reformatDOB = ->
    return false if _.isEmpty(Service.loggedInUser)
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

AccountService.$inject = ['$state', '$auth', 'ShortFormApplicationService']

angular
  .module('dahlia.services')
  .service('AccountService', AccountService)
