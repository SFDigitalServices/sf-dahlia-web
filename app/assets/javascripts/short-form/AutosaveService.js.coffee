############################################################################################
####################################### SERVICE ############################################
############################################################################################

AutosaveService = (
  $interval, ShortFormApplicationService
) ->
  Service = {}
  Service.timer = null

  Service.save = ->
    ShortFormApplicationService.submitApplication({autosave: true})

  Service.startTimer = ->
    if !Service.timer
      Service.timer = $interval(Service.save, 60000)

  Service.stopTimer = ->
    $interval.cancel(Service.timer)
    Service.timer = null

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AutosaveService.$inject = [
  '$interval', 'ShortFormApplicationService',
]

angular
  .module('dahlia.services')
  .service('AutosaveService', AutosaveService)
