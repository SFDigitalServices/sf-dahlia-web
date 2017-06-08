WelcomeController = ($http, $scope) ->

  $scope.chinese_counselors = []
  $scope.filipino_counselors = []
  $scope.spanish_counselors = []

  $http.get("/json/housing_counselors.json").success((data, status, headers, config) ->
    $scope.chinese_counselors = _.filter data.locations, (o) ->
      _.includes o.languages, 'Cantonese'
    $scope.filipino_counselors = _.filter data.locations, (o) ->
      _.includes o.languages, 'Tagalog'
    $scope.spanish_counselors = _.filter data.locations, (o) ->
      _.includes o.languages, 'Spanish'
  )

  $scope.languages = (pageLanguage, assistanceLanguages) ->
    languages = ''
    divider = ', '
    assistanceLanguages.forEach (assistanceLanguage) ->
      languages += $scope.placeholderTranslate(pageLanguage, assistanceLanguage)
      languages += divider
    _.trimEnd(languages, divider)

  # TODO: Replace with POEditor and translate like the rest of the app
  $scope.placeholderTranslate = (language, word) ->
    if language == 'Spanish'
      return 'Inglés' if word == 'English'
      return 'Español' if word == 'Spanish'
      return 'Cantonés' if word == 'Cantonese'
      return 'Filipino' if word == 'Tagalog'
      return 'Ruso' if word == 'Russian'
      return 'Samoano' if word == 'Samoan'
      return 'Lenguaje de Señas Americano' if word == 'American Sign Language'
    else if language == 'Cantonese'
      return 'translate'
    else if language == 'Tagalog'
      return 'translate'

WelcomeController.$inject = ['$http','$scope']

angular
  .module('dahlia.controllers')
  .controller('WelcomeController', WelcomeController)
