ModalInstanceController = ($scope, $modalInstance) ->

  $scope.closeModal = () ->
    $modalInstance.close()

  $scope.$on '$locationChangeStart', ->
    $modalInstance.close()
    return


ModalInstanceController.$inject = ['$scope', '$modalInstance']

angular
  .module('dahlia.controllers')
  .controller('ModalInstanceController', ModalInstanceController)
