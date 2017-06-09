############################################################################################
####################################### SERVICE ############################################
############################################################################################

ModalService = ($modal) ->
  Service = {}
  Service.modalInstance = null
  Service.messages = {}
  Service.callbacks = {}

  Service.alert = (message, onConfirm) ->
    Service.messages.alert = message
    Service.callbacks.onConfirm = onConfirm
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

ModalService.$inject = ['$modal']

angular
  .module('dahlia.services')
  .service('ModalService', ModalService)
