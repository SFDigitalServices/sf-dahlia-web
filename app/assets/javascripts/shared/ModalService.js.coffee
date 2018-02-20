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
      if (Service.modalInstance)
        Service.modalInstance.result.then( ->
          Service.modalInstance = null
          Service._mobileAlert()
        ).catch( ->
          Service.modalInstance = null
        )
      else
        Service._mobileAlert()

  Service._mobileAlert = ->
    Service.modalInstance = $modal.open(
      templateUrl: 'shared/templates/alert_modal.html',
      controller: 'ModalInstanceController',
      windowClass: 'modal-large'
    )




  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ModalService.$inject = ['$modal', '$window']

angular
  .module('dahlia.services')
  .service('ModalService', ModalService)
