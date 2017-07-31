WelcomeController = ($scope, SharedService) ->
  $scope.housingCounselors = SharedService.housingCounselors

WelcomeController.$inject = ['$scope', 'SharedService']

angular
  .module('dahlia.controllers')
  .controller('WelcomeController', WelcomeController)
