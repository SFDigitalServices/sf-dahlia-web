############################################################################################
####################################### SERVICE ############################################
############################################################################################

HcSessionEndedService = (
  $auth
) ->
  Service = {}
  signingOut = false

  Service.handle = (error) ->
    return unless error.data?.error == 'hc_session_ended'
    # autosave and a click can fail together, and a second sign-out would reset ClerkShim.signingOut early
    return if signingOut
    signingOut = true
    $auth.signOut().finally -> signingOut = false
    return

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

HcSessionEndedService.$inject = [
  '$auth',
]

angular
  .module('dahlia.services')
  .service('HcSessionEndedService', HcSessionEndedService)
