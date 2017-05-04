angular.module('dahlia.components')
.component 'shortFormLanguageSwitcher',
  templateUrl: 'short-form/components/short-form-language-switcher.html'
  controller: ['$state', '$scope', ($state, $scope) ->
    ctrl = @

    @stateName = $state.current.name
    $scope.$on '$stateChangeSuccess', (e, toState, toParams, fromState, fromParams) =>
      @stateName = toState.name

    return ctrl
  ]
