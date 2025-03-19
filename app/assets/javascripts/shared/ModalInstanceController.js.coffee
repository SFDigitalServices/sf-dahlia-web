ModalInstanceController = ($scope, ModalService) ->
  $scope.content = ModalService.content

  $scope.closeModal = (shouldCallOnClose = true) ->
    if shouldCallOnClose
      ModalService.callbacks.onClose() if ModalService.callbacks.onClose
    ModalService.closeModal()

  $scope.confirm = ->
    ModalService.callbacks.onConfirm() if ModalService.callbacks.onConfirm
    $scope.closeModal(false)

ModalInstanceController.$inject = ['$scope', 'ModalService']

angular
  .module('dahlia.controllers')
  .controller('ModalInstanceController', ModalInstanceController)
