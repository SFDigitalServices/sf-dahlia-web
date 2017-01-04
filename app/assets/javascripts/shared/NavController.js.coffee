############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

NavController = ($document, $rootScope, $scope, $state, $timeout, AccountService) ->
  $scope.loggedIn = AccountService.loggedIn
  $scope.showNavMobile = false

  $scope.signOut = ->
    $state.go('dahlia.welcome')
    AccountService.signOut()

  $scope.closeNavMobile = ->
    $scope.showNavMobile = false
    $scope.focusOnMenuButton()

  $scope.openNavMobile = ->
    $scope.showNavMobile = true

  $scope.focusOnNavMobile = ->
    $scope.focusOnElement('nav-mobile-topfocus')

  $scope.focusOnMenuButton = ->
    $scope.focusOnElement('open-nav-mobile')

  $scope.focusOnElement = (className) ->
    # put it on a slight delay so that it doesn't mess with the mobile nav slideout animation
    $timeout ->
      element = _.last $document[0].getElementsByClassName(className)
      element.focus()
    , 333

  $rootScope.$on '$stateChangeStart', ->
    # always close the mobile nav when state changes
    $scope.closeNavMobile()


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
