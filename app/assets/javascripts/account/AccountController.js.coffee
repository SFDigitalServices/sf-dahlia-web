AccountController = ($scope, AccountService) ->

  $scope.continueApplication = ->
    AccountService.returnToRememberedState()

AccountController.$inject = ['$scope', 'AccountService']

angular
  .module('dahlia.controllers')
  .controller('AccountController', AccountController)
