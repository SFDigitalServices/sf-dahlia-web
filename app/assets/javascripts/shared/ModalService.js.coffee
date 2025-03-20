############################################################################################
####################################### SERVICE ############################################
############################################################################################

ModalService = ($modal, $window) ->
  Service = {}
  Service.modalInstance = null
  Service.content = {}
  Service.callbacks = {}

  Service.openModal = (templateUrl, windowClass = 'modal-large') ->
    # close any modal that may already be open before opening a new one
    Service.closeModal()

    if templateUrl
      Service.modalInstance = $modal.open({
        templateUrl: templateUrl,
        controller: 'ModalInstanceController',
        windowClass: windowClass
      })

  Service.alert = (content, opts = {}) ->
    angular.copy(content, Service.content)
    Service.callbacks.onConfirm = opts.onConfirm if opts.onConfirm
    Service.callbacks.onClose = opts.onClose if opts.onClose
    nativeAlert = !!opts.nativeAlert
    if nativeAlert && !$window.navigator.userAgent.match(/iPhone|iPad|iPod/i)
      $window.alert(content.message)
    else
      Service.openModal('shared/templates/alert_modal.html')

  Service.closeModal = () ->
    Service.modalInstance.close() if Service.modalInstance
    Service._clearModalInstance()

  Service._clearModalInstance = () ->
    Service.modalInstance = null

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ModalService.$inject = ['$modal', '$window']

angular
  .module('dahlia.services')
  .service('ModalService', ModalService)
