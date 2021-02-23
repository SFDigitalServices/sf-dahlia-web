############################################################################################
####################################### SERVICE ############################################
############################################################################################

AuthConfigurationService = ($state, $location, AccountService) ->
  Service = {}

  Service.confirmationSuccessUrl = ->
    # give absolute (full) URL to provide to server for redirect
    # TODO: can figure out other options/redirects if there
    #       are different UX paths needing different modals/params
    $state.href('dahlia.my-account', {}, {absolute: true})

  Service.passwordResetSuccessUrl = ->
    # give absolute (full) URL to provide to server for redirect
    # Url used for sucessful password reset request
    $state.href('dahlia.reset-password', {}, {absolute: true})

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

AuthConfigurationService.$inject = ['$state', '$location', 'AccountService']

angular
  .module('dahlia.services')
  .service('AuthConfigurationService', AuthConfigurationService)
