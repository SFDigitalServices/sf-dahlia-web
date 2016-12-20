############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

NavController = ($document, $rootScope, $scope, $state, $timeout, AccountService) ->
  $scope.loggedIn = AccountService.loggedIn

  $scope.signOut = ->
    $state.go('dahlia.welcome')
    AccountService.signOut()

  $scope.showNavMobile = false
  $scope.toggleNavMobile = ->
    $scope.showNavMobile = !$scope.showNavMobile

  $scope.focusOnMobileNav = ->
    # put it on a slight delay so that it doesn't mess with the mobile nav slideout animation
    $timeout ->
      element = _.last $document[0].getElementsByClassName('nav-mobile-topfocus')
      element.focus()
    , 333

  $rootScope.$on '$stateChangeStart', ->
    # Always close the mobile nav when state changes
    $scope.showNavMobile = false


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
