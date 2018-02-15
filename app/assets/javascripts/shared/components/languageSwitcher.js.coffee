angular.module('dahlia.components')
.component 'languageSwitcher',
  templateUrl: 'shared/components/language-switcher.html'
  controller: ['SharedService', '$state', '$scope', (SharedService, $state, $scope) ->
    ctrl = @

    @switchToLanguage = (lang) ->
      toStateName = $state.current.name

      if SharedService.isWelcomePage($state.current)
        if lang == 'en'
          toStateName = 'dahlia.welcome'
        else
          longLang = SharedService.languageMap[lang].toLowerCase()
          toStateName = "dahlia.welcome-#{longLang}"

      href = $state.href(toStateName, {lang: lang})

      if toStateName == 'dahlia.welcome'
        href += '/'

      return href

    @isSelectedLanguage = (lang) ->
      $state.params.lang == lang

    return ctrl
  ]
