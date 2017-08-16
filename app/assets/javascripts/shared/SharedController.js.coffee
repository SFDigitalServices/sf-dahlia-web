############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

SharedController = ($scope, $state, SharedService) ->
  $scope.assetPaths = SharedService.assetPaths
  $scope.housingCounselors = SharedService.housingCounselors

  $scope.alternateLanguageLinks = SharedService.alternateLanguageLinks

  $scope.isShortFormPage = () ->
    $state.includes('dahlia.short-form-welcome') || $state.includes('dahlia.short-form-application')

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
