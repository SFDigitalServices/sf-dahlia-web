############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

NavController = ($scope, $state) ->

  $scope.showListingsNav = () ->
    ["dahlia.favorites", "dahlia.listing", "dahlia.share"].indexOf($state.current.name) > -1

  $scope.showFavoritesNav = () ->
    $state.current.name == "dahlia.listings"

  $scope.showSocial = () ->
    $state.current.name == "dahlia.favorites"

############################################################################################
######################################## CONFIG ############################################
############################################################################################

NavController.$inject = ['$scope', '$state']

angular
  .module('dahlia.controllers')
  .controller('NavController', NavController)
