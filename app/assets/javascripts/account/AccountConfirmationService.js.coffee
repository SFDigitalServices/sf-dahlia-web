############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountConfirmationService = ($location, AccountService) ->
  Service = {}

  Service.baseUrl = ->
    port = if $location.port() == 80 then '' else  ":#{$location.port()}"
    "#{$location.protocol()}://#{$location.host()}#{port}"

  Service.confirmationSuccessUrl = ->
    # TODO: update this logic using AccountService
    "#{Service.baseUrl()}/?yippee"

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountConfirmationService.$inject = ['$location', 'AccountService']

angular
  .module('dahlia.services')
  .service('AccountConfirmationService', AccountConfirmationService)
