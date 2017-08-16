############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

SharedController = ($rootScope, $scope, $state, SharedService, GoogleTranslateService) ->

  $scope.alternateLanguageLinks = SharedService.alternateLanguageLinks

  $scope.doNotGoogleTranslate = () ->
    $scope.isShortFormPage() || $scope.isWelcomePage() || $scope.isEnglish()

  $scope.isShortFormPage = ->
    $state.includes('dahlia.short-form-welcome') || $state.includes('dahlia.short-form-application')

  $scope.isWelcomePage = () ->
    $state.includes('dahlia.welcome-spanish') || $state.includes('dahlia.welcome-chinese') ||
    $state.includes('dahlia.welcome-filipino')

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
  '$rootScope', '$scope', '$state', 'SharedService', 'GoogleTranslateService'
]

angular
  .module('dahlia.controllers')
  .controller('SharedController', SharedController)
