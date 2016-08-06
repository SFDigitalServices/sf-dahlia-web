############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountConfirmationService = ($state, $location, AccountService) ->
  Service = {}

  Service.baseUrl = ->
    port = if $location.port() == 80 then '' else  ":#{$location.port()}"
    "#{$location.protocol()}://#{$location.host()}#{port}"

  Service.confirmationSuccessUrl = ->
    # give absolute (full) URL to provide to server for redirect
    # TODO: can figure out other options/redirects if there
    #       are different UX paths needing different modals/params
    $state.href('dahlia.my-account', {}, {absolute: true})

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountConfirmationService.$inject = ['$state', '$location', 'AccountService']

angular
  .module('dahlia.services')
  .service('AccountConfirmationService', AccountConfirmationService)
