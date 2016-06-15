############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = ($state, $auth) ->
  Service = {}
  Service.userAuth = {}
  Service.rememberedState = null
  Service.rememberedStateParams = null

  Service.rememberState = (name, params) ->
    Service.rememberedState = name
    Service.rememberedStateParams = params

  Service.returnToRememberedState = () ->
    $state.go(Service.rememberedState, Service.rememberedStateParams)


  Service.createAccount = ->
    # userAuth = _.filter(Service.userAuth, (v,k) -> k != 'email_confirmation')
    $auth.submitRegistration(Service.userAuth)
      .then((response) ->
        # handle success response
        alert('OK!')
      ).catch((response) ->
        # handle error response
        # console.warn(response)
        alert("Error: #{response.data.errors.full_messages[0]}")
      )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountService.$inject = ['$state', '$auth']

angular
  .module('dahlia.services')
  .service('AccountService', AccountService)
