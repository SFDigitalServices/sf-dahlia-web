############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShareController = ($scope, $state, $window) ->

  $scope.clipboardLink = ->
    # get the link to /listings/:id using the listing :id of the share page route
    link = $state.href('listing', {id: $state.params.id})
    "http://#{$window.location.host}/#{link}"

  $scope.clipboardSuccess = ->
    $window.alert("The Listing URL has been copied to your clipboard.")

  $scope.emailShare = ->
    $window.alert("Email sent.")
    $scope.email = ''

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ShareController.$inject = ['$scope', '$state', '$window']

angular
  .module('dahlia.controllers')
  .controller('ShareController', ShareController)
