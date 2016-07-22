############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

NavController = ($document, $rootScope, $scope, $state, AccountService) ->
  $scope.loggedIn = AccountService.loggedIn
  $scope.showAccountDropdown = false

  # Utility function to scroll to top of page when state changes.
  $rootScope.$on '$stateChangeSuccess', ->
    $document.scrollTop(0)
    $scope.showAccountDropdown = false

  $scope.signOut = ->
    $state.go('dahlia.welcome')
    AccountService.signOut()

  $scope.showNavMobile = false
  $scope.toggleNavMobile = () ->
    $scope.showNavMobile = !$scope.showNavMobile

  $scope.toggleAccountDropdown = ->
    $scope.showAccountDropdown = !$scope.showAccountDropdown

############################################################################################
######################################## CONFIG ############################################
############################################################################################

NavController.$inject = [
  '$document', '$rootScope', '$scope', '$state', 'AccountService'
]

angular
  .module('dahlia.controllers')
  .controller('NavController', NavController)
