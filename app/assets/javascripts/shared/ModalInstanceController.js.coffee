ModalInstanceController = ($scope, $modalInstance, AccountService) ->
  # on instantiation, set the AccountService modalinstance
  # this is to give the service the ability to close the modal upon signing out
  AccountService.modalInstance = $modalInstance

  $scope.closeModal = () ->
    $modalInstance.close()

ModalInstanceController.$inject = ['$scope', '$modalInstance', 'AccountService']

angular
  .module('dahlia.controllers')
  .controller('ModalInstanceController', ModalInstanceController)
