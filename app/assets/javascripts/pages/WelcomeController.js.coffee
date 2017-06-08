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

  # TODO: these rules seem overcomplicated
  # consider replacing with POEditor to translate entire phrases
  $scope.languages = (pageLanguage, assistanceLanguages) ->

    # none of the lists actually mention English; pull
    _.pull(assistanceLanguages, 'English')

    # if the page language is the only one, just return that
    if _.size(assistanceLanguages) == 1
      return $scope.placeholderTranslate(pageLanguage, assistanceLanguages[0])
    else
      # always start with the page language, then remove from list
      languages = $scope.placeholderTranslate(pageLanguage, pageLanguage)
      _.pull(assistanceLanguages, pageLanguage)

      # add other languages
      languages += ' (' + $scope.placeholderTranslate(pageLanguage, 'and') + ' '

      # if only one other language
      if _.size(assistanceLanguages) == 1
        languages += $scope.placeholderTranslate(pageLanguage, assistanceLanguages[0]) + ')'

      # if two others
      else if _.size(assistanceLanguages) == 2
        languages += $scope.placeholderTranslate(pageLanguage, assistanceLanguages[0])
        languages += ' ' + $scope.placeholderTranslate(pageLanguage, 'and') + ' '
        languages += $scope.placeholderTranslate(pageLanguage, assistanceLanguages[1]) + ')'

      # if three or more others
      else
        i = 0
        while i < _.size(assistanceLanguages)
          if i == _.size(assistanceLanguages) - 1
            languages += $scope.placeholderTranslate(pageLanguage, 'and') + ' '
            languages += $scope.placeholderTranslate(pageLanguage, assistanceLanguages[i])
            languages += ')'
          else
            languages += $scope.placeholderTranslate(pageLanguage, assistanceLanguages[i]) + ', '
          i++
      languages

  # TODO: Replace with POEditor and translate like the rest of the app
  $scope.placeholderTranslate = (language, word) ->
    if language == 'Spanish'
      return 'y' if word == 'and'
      return 'Inglés' if word == 'English'
      return 'Español' if word == 'Spanish'
      return 'Cantonés' if word == 'Cantonese'
      return 'Filipino' if word == 'Tagalog'
      return 'Ruso' if word == 'Russian'
      return 'Samoano' if word == 'Samoan'
      return 'Lenguaje de Señas Americano' if word == 'American Sign Language'
      if word == 'BALANCE (formerly Consumer Credit Counseling)'
        return 'BALANCE (antes Consumer Credit Counseling)'
      if word == 'The Arc San Francisco (focused on developmentally-disabled persons)'
        return 'The Arc San Francisco (enfocado en personas con discapacidades del desarrollo)'
    else if language == 'Cantonese'
      return 'translate'
    else if language == 'Tagalog'
      return 'at' if word == 'and'
      if word == 'BALANCE (formerly Consumer Credit Counseling)'
        return 'BALANCE (ang dating Consumer Credit Counseling)'
      if word == 'The Arc San Francisco (focused on developmentally-disabled persons)'
        return 'The Arc San Francisco (nakatutuk sa mga tao’ng may pangkaunlaran na kapansanan)'
    return word

WelcomeController.$inject = ['$http','$scope']

angular
  .module('dahlia.controllers')
  .controller('WelcomeController', WelcomeController)
