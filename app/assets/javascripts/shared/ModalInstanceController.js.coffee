ModalInstanceController = ($scope, $modalInstance, ModalService) ->
  $scope.messages = ModalService.messages

  $scope.closeModal = () ->
    ModalService.callbacks.onCancel() if ModalService.callbacks.onCancel
    $modalInstance.close()

  $scope.confirm = ->
    ModalService.callbacks.onConfirm() if ModalService.callbacks.onConfirm
    $modalInstance.close()

ModalInstanceController.$inject = ['$scope', '$modalInstance', 'ModalService']

angular
  .module('dahlia.controllers')
  .controller('ModalInstanceController', ModalInstanceController)
