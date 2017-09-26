############################################################################################
####################################### SERVICE ############################################
############################################################################################

ModalService = ($modal) ->
  Service = {}
  Service.modalInstance = null
  Service.messages = {}
  Service.callbacks = {}

  Service.alert = (content, onConfirm) ->
    Service.messages.title =  content.title
    Service.messages.alert = content.alert
    Service.messages.message = content.message
    Service.messages.cancel = content.cancel
    Service.messages.continue = content.continue
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
