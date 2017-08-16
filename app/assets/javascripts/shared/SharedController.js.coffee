############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

SharedController = ($scope, $state, SharedService, GoogleTranslateService) ->
  $scope.assetPaths = SharedService.assetPaths
  $scope.housingCounselors = SharedService.housingCounselors
  $scope.alternateLanguageLinks = SharedService.alternateLanguageLinks

  $scope.isShortFormPage = ->
    $state.includes('dahlia.short-form-welcome') || $state.includes('dahlia.short-form-application')

  $scope.isShortFormPageOrEnglish = ->
    $scope.isShortFormPage() || $scope.isEnglish()

  $scope.isEnglish = ->
    $state.params.lang == 'en'

  $scope.focusOnMainContent = ->
    SharedService.focusOnMainContent()

  $scope.translateWelcomePath = ->
    translateWelcomeMap =
     'zh-CN': 'welcome-chinese'
     'zh': 'welcome-chinese'
     'es': 'welcome-spanish'
     'en': 'welcome'
     'tl': 'welcome-filipino'

    stateName = translateWelcomeMap[GoogleTranslateService.language]
    return "dahlia." + stateName

############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedController.$inject = [
  '$scope', '$state', 'SharedService', 'GoogleTranslateService'
]

angular
  .module('dahlia.controllers')
  .controller('SharedController', SharedController)
