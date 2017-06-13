WelcomeController = ($http, $scope) ->

  $scope.chinese_counselors = []
  $scope.filipino_counselors = []
  $scope.spanish_counselors = []

  $http.get("/json/housing_counselors.json").success((data, status, headers, config) ->
    $scope.chinese_counselors = _.filter data.locations, (o) ->
      _.includes o.languages, 'Cantonese'
    $scope.filipino_counselors = _.filter data.locations, (o) ->
      _.includes o.languages, 'Filipino'
    $scope.spanish_counselors = _.filter data.locations, (o) ->
      _.includes o.languages, 'Spanish'
  )

WelcomeController.$inject = ['$http','$scope']

angular
  .module('dahlia.controllers')
  .controller('WelcomeController', WelcomeController)
