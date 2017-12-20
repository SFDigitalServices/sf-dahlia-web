############################################################################################
####################################### SERVICE ############################################
############################################################################################

ModalService = ($modal, $window) ->
  Service = {}
  Service.modalInstance = null
  Service.content = {}
  Service.callbacks = {}

  Service.alert = (content, opts = {}) ->
    angular.copy(content, Service.content)
    Service.callbacks.onConfirm = opts.onConfirm if opts.onConfirm
    nativeAlert = !!opts.nativeAlert
    if nativeAlert && !$window.navigator.userAgent.match(/iPhone|iPad|iPod/i)
      $window.alert(content.message)
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
