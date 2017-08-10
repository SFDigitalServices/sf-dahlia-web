############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

SharedController = ($rootScope, $scope, $state, SharedService) ->

  $scope.alternateLanguageLinks = SharedService.alternateLanguageLinks

  $scope.isShortFormPage = () ->
    $state.includes('dahlia.short-form-welcome') || $state.includes('dahlia.short-form-application')

  $scope.isShortFormPageOrEnglish = () ->
    $scope.isShortFormPage() || $state.params.lang == 'en'

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
