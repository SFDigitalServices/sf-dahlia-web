############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

SharedController = ($scope, $state, SharedService) ->
  $scope.assetPaths = SharedService.assetPaths
  $scope.housingCounselors = SharedService.housingCounselors

  $scope.hasCenterBody = () ->
    if $state.includes('dahlia.short-form-welcome') || $state.includes('dahlia.short-form-application')
      return 'center-body'

  $scope.focusOnMainContent = ->
    SharedService.focusOnMainContent()

############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedController.$inject = [
  '$scope', '$state', 'SharedService'
]

angular
  .module('dahlia.controllers')
  .controller('SharedController', SharedController)
