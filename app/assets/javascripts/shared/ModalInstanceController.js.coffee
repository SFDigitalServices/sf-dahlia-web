ModalInstanceController = ($scope, ModalService) ->
  $scope.content = ModalService.content

  $scope.closeModal = () ->
    ModalService.callbacks.onConfirm() if ModalService.callbacks.onConfirm
    ModalService.closeModal()

  $scope.confirm = ->
    ModalService.callbacks.onConfirm() if ModalService.callbacks.onConfirm
    $scope.closeModal()

ModalInstanceController.$inject = ['$scope', 'ModalService']

angular
  .module('dahlia.controllers')
  .controller('ModalInstanceController', ModalInstanceController)
