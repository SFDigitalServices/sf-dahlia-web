HousingCounselorsController = ($http, $scope) ->

  $scope.housing_counselors = []

  $http.get("/json/housing_counselors.json").success((data, status, headers, config) ->
    $scope.housing_counselors = data.locations
  )

HousingCounselorsController.$inject = ['$http','$scope']

angular
  .module('dahlia.controllers')
  .controller('HousingCounselorsController', HousingCounselorsController)
