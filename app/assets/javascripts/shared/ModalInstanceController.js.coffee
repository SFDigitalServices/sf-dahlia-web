ModalInstanceController = ($scope, $modalInstance) ->

  $scope.closeModal = () ->
    $modalInstance.close()

ModalInstanceController.$inject = ['$scope', '$modalInstance']

angular
  .module('dahlia.controllers')
  .controller('ModalInstanceController', ModalInstanceController)
