############################################################################################
####################################### SERVICE ############################################
############################################################################################

ModalService = ($modal, $window) ->
  Service = {}
  Service.modalInstance = null
  Service.messages = {}
  Service.callbacks = {}

  Service.alert = (message, onConfirm, useAlert) ->
    Service.messages.alert = message
    Service.callbacks.onConfirm = onConfirm
    useAlert = false if !useAlert?
    if useAlert && !$window.navigator.userAgent.match(/iPhone|iPad|iPod/i)
      $window.alert(message)
    else
      if (!Service.modalInstance)
        Service.modalInstance = $modal.open(
          templateUrl: 'shared/templates/alert_modal.html',
          controller: 'ModalInstanceController',
          windowClass: 'modal-large'
        )
        Service.modalInstance.result.then( ->
          Service.modalInstance = null
        ).catch( ->
          Service.modalInstance = null
        )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ModalService.$inject = ['$modal', '$window']

angular
  .module('dahlia.services')
  .service('ModalService', ModalService)
