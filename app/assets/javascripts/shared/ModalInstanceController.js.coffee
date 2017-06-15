ModalInstanceController = ($scope, $modalInstance, ModalService) ->
  $scope.messages = ModalService.messages
  $scope.showCancelButton = !!ModalService.callbacks.onConfirm

  $scope.closeModal = () ->
    $modalInstance.close()

  $scope.confirm = ->
    ModalService.callbacks.onConfirm() if ModalService.callbacks.onConfirm
    $modalInstance.close()

ModalInstanceController.$inject = ['$scope', '$modalInstance', 'ModalService']

angular
  .module('dahlia.controllers')
  .controller('ModalInstanceController', ModalInstanceController)
