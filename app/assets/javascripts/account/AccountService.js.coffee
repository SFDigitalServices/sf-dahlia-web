############################################################################################
####################################### SERVICE ############################################
############################################################################################

AccountService = ($state) ->
  Service = {}
  Service.rememberedState = null
  Service.rememberedStateParams = null

  Service.rememberState = (name, params) ->
    Service.rememberedState = name
    Service.rememberedStateParams = params

  Service.returnToRememberedState = () ->
    $state.go(Service.rememberedState, Service.rememberedStateParams)

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AccountService.$inject = ['$state']

angular
  .module('dahlia.services')
  .service('AccountService', AccountService)
