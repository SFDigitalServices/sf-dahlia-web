HousingCounselorsController = ($scope, SharedService) ->
  $scope.housingCounselors = SharedService.housingCounselors

HousingCounselorsController.$inject = ['$scope', 'SharedService']

angular
  .module('dahlia.controllers')
  .controller('HousingCounselorsController', HousingCounselorsController)
