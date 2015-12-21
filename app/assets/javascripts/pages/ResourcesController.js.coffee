ResourcesController = ($http, $scope) ->

  $scope.resources = []

  $http.get("/../json/resources.json").success((data, status, headers, config) ->
    $scope.resources = data.locations
  )

ResourcesController.$inject = ['$http','$scope']

angular
  .module('dahlia.controllers')
  .controller('ResourcesController', ResourcesController)
