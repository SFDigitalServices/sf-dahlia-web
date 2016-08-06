############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

SharedController = ($rootScope, $scope, $state) ->

  $scope.hasCenterBody = () ->
    if $state.includes('dahlia.short-form-welcome') || $state.includes('dahlia.short-form-application')
      return 'center-body'

############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedController.$inject = [
  '$rootScope', '$scope', '$state'
]

angular
  .module('dahlia.controllers')
  .controller('SharedController', SharedController)
