############################################################################################
####################################### SERVICE ############################################
############################################################################################

ModalService = ($modal, $window) ->
  Service = {}
  Service.modalInstance = null
  Service.content = {}
  Service.callbacks = {}

  Service.openModal = (templateUrl, windowClass = 'modal-large') ->
    if templateUrl
      Service.modalInstance = $modal.open({
        templateUrl: templateUrl,
        controller: 'ModalInstanceController',
        windowClass: windowClass
      })

  Service.alert = (content, opts = {}) ->
    angular.copy(content, Service.content)
    Service.callbacks.onConfirm = opts.onConfirm if opts.onConfirm
    nativeAlert = !!opts.nativeAlert
    if nativeAlert && !$window.navigator.userAgent.match(/iPhone|iPad|iPod/i)
      $window.alert(content.message)
    else
      if (!Service.modalInstance)
        Service.openModal('shared/templates/alert_modal.html')
        Service.modalInstance.result.then( ->
          Service.modalInstance = null
        ).catch( ->
          Service.modalInstance = null
        )

  Service.closeModal = () ->
    Service.modalInstance.close() if Service.modalInstance

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ModalService.$inject = ['$modal', '$window']

angular
  .module('dahlia.services')
  .service('ModalService', ModalService)
