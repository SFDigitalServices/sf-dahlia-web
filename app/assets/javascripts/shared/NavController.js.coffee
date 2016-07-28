############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

NavController = ($document, $rootScope, $scope, $state, AccountService) ->
  $scope.loggedIn = AccountService.loggedIn

  # Utility function to scroll to top of page when state changes.
  $rootScope.$on '$stateChangeSuccess', ->
    $document.scrollTop(0)

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
  '$document', '$rootScope', '$scope', '$state', 'AccountService'
]

angular
  .module('dahlia.controllers')
  .controller('NavController', NavController)
