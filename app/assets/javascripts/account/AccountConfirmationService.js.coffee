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
    # TODO: update this logic using AccountService once we are ready
    #       to set up confirmation success pages + modals
    $state.href('dahlia.my-account', {}, {absolute: true})

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountConfirmationService.$inject = ['$state', '$location', 'AccountService']

angular
  .module('dahlia.services')
  .service('AccountConfirmationService', AccountConfirmationService)
