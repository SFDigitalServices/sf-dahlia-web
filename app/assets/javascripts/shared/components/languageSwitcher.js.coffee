angular.module('dahlia.components')
.component 'languageSwitcher',
  templateUrl: 'shared/components/language-switcher.html'
  controller: ['$state', '$scope', ($state, $scope) ->
    ctrl = @

    @switchToLanguage = (lang) ->
      href = $state.href($state.current.name, {lang: lang})
      if $state.current.name == 'dahlia.welcome'
        href = href + "/"
      href

    return ctrl
  ]
