angular.module('dahlia.components')
.component 'languageSwitcher', {
  template: require('html-loader!application/shared/components/language-switcher.html')
  controller: ['SharedService', '$state', '$scope', (SharedService, $state, $scope) ->
    $scope.stateForLanguage = (lang) ->
      toStateName = $state.current.name

      if SharedService.isWelcomePage($state.current)
        if lang == 'en'
          toStateName = 'dahlia.welcome'
        else
          longLang = SharedService.getLanguageName(lang).toLowerCase()
          toStateName = "dahlia.welcome-#{longLang}"

      return toStateName

    $scope.isSelectedLanguage = (lang) ->
      $state.params.lang == lang
  ]
}
