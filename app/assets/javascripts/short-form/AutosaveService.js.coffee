############################################################################################
####################################### SERVICE ############################################
############################################################################################

AutosaveService = (
  ShortFormApplicationService,
) ->
  Service = {}

  Service.save = ->
    ShortFormApplicationService.submitApplication({autosave: true})

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AutosaveService.$inject = [
  'ShortFormApplicationService',
]

angular
  .module('dahlia.services')
  .service('AutosaveService', AutosaveService)
