############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShareController = ($scope, $state, $window, SharedService) ->
  $scope.shared = SharedService
  $scope.showShareSuccess = false

  $scope.clipboardLink = ->
    # get the link to /listings/:id using the listing :id of the share page route
    link = $state.href('dahlia.listing', {id: $state.params.id})
    "http://#{$window.location.host}#{link}"

  $scope.textToCopy = $scope.clipboardLink()

  $scope.clipboardSuccess = ->
    $scope.showShareSuccess = true

  $scope.closeShareSuccess = ->
    $scope.showShareSuccess = false

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ShareController.$inject = ['$scope', '$state', '$window', 'SharedService']

angular
  .module('dahlia.controllers')
  .controller('ShareController', ShareController)
