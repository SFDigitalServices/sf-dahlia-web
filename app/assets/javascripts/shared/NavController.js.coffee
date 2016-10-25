############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

NavController = ($document, $rootScope, $scope, $state, $timeout, AccountService) ->
  $scope.loggedIn = AccountService.loggedIn

  # Utility function to scroll to top of page when state changes.
  $rootScope.$on '$stateChangeSuccess', ->
    $document.scrollTop(0)
    $timeout ->
      topfocus = _.last $document[0].getElementsByClassName('topfocus')
      focusContainer = _.last $document[0].getElementsByClassName('focus-container')
      if focusContainer
        el = focusContainer.querySelectorAll('input, a, button')[0]
        i = 0
        while el.className == 'close' && el
          el = focusContainer.querySelectorAll('input, a, button')[i]
          i++
        el.focus() if el
      else
        topfocus.focus()
        topfocus.blur()

  $scope.signOut = ->
    $state.go('dahlia.welcome')
    AccountService.signOut()

  $scope.showNavMobile = false
  $scope.toggleNavMobile = () ->
    $scope.showNavMobile = !$scope.showNavMobile

############################################################################################
######################################## CONFIG ############################################
############################################################################################

NavController.$inject = [
  '$document', '$rootScope', '$scope', '$state', '$timeout',
  'AccountService'
]

angular
  .module('dahlia.controllers')
  .controller('NavController', NavController)
