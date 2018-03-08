ModalInstanceController = ($scope, $modalInstance, ModalService) ->
  $scope.content = ModalService.content

  $scope.closeModal = () ->
    ModalService.closeModal()

  $scope.confirm = ->
    ModalService.callbacks.onConfirm() if ModalService.callbacks.onConfirm
    $modalInstance.close()

ModalInstanceController.$inject = ['$scope', '$modalInstance', 'ModalService']

angular
  .module('dahlia.controllers')
  .controller('ModalInstanceController', ModalInstanceController)
