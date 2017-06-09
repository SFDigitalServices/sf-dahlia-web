############################################################################################
####################################### SERVICE ############################################
############################################################################################

ModalService = ($modal) ->
  Service = {}
  Service.modalInstance = null
  Service.messages = {}
  Service.callbacks = {}

  Service.alert = (message, onConfirm, onCancel) ->
    Service.messages.alert = message
    Service.callbacks.onConfirm = onConfirm
    Service.callbacks.onCancel = onCancel
    if (!Service.modalInstance)
      Service.modalInstance = $modal.open(
        templateUrl: 'shared/templates/alert_modal.html',
        controller: 'ModalInstanceController',
        windowClass: 'modal-large'
      )
      Service.modalInstance.result.then( ->
        modalInstance = null
      ).catch( ->
        modalInstance = null
        Service.callbacks.onCancel() if Service.callbacks.onCancel
      )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ModalService.$inject = ['$modal']

angular
  .module('dahlia.services')
  .service('ModalService', ModalService)
