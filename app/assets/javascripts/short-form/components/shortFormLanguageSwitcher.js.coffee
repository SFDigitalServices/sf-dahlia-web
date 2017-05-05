angular.module('dahlia.components')
.component 'shortFormLanguageSwitcher',
  templateUrl: 'short-form/components/short-form-language-switcher.html'
  controller: ['$state', '$scope', ($state, $scope) ->
    ctrl = @

    @switchToLanguage = (lang) ->
      $state.href($state.current.name, {lang: lang})

    @isSelectedLanguage = (lang) ->
      $state.params.lang == lang

    return ctrl
  ]
