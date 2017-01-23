############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

SharedController = ($rootScope, $scope, $state, SharedService) ->

  $scope.hasCenterBody = () ->
    if $state.includes('dahlia.short-form-welcome') || $state.includes('dahlia.short-form-application')
      return 'center-body'

  $scope.focusOnMainContent = ->
    SharedService.focusOnMainContent()


############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedController.$inject = [
  '$rootScope', '$scope', '$state', 'SharedService'
]

angular
  .module('dahlia.controllers')
  .controller('SharedController', SharedController)
