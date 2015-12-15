############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

NavController = ($rootScope, $scope, $state) ->

  # Utility function to scroll to top of page when state changes.
  $rootScope.$on '$stateChangeSuccess', ->
    document.body.scrollTop = document.documentElement.scrollTop = 0

  $scope.showNavMobile = false
  $scope.toggleNavMobile = () ->
    $scope.showNavMobile = !$scope.showNavMobile

############################################################################################
######################################## CONFIG ############################################
############################################################################################

NavController.$inject = ['$rootScope', '$scope', '$state']

angular
  .module('dahlia.controllers')
  .controller('NavController', NavController)
