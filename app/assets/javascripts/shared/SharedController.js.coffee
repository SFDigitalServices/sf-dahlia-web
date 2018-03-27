############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

SharedController = ($scope, $state, $stateParams, $window, SharedService, ExternalTranslateService) ->
  $scope.assetPaths = SharedService.assetPaths
  $scope.housingCounselors = SharedService.housingCounselors
  $scope.alternateLanguageLinks = SharedService.alternateLanguageLinks

  $scope.doNotGoogleTranslate = ->
    $scope.isShortFormPage() || $scope.isWelcomePage() || $scope.isEnglish()

  $scope.showTranslationExpertMessage = ->
    $scope.isShortFormPage() || $scope.isWelcomePage()

  $scope.isShortFormPage = ->
    $state.includes('dahlia.short-form-welcome') || $state.includes('dahlia.short-form-application')

  $scope.isWelcomePage = ->
    SharedService.isWelcomePage()

  $scope.isEnglish = ->
    $state.params.lang == 'en'

  $scope.feedbackUrl = 'https://docs.google.com/\
    forms/d/e/1FAIpQLSfJQL6ewvzETV7ZkWot94CaVlI7XlGPbhny4w6mPmDqZS995Q/viewform?usp=sf_link'

  $scope.alertMessage = if $window.ALERT_MESSAGE then $window.ALERT_MESSAGE else ''

  $scope.hasCenterBody = () ->
    if $state.includes('dahlia.short-form-welcome') ||
      $state.includes('dahlia.short-form-application') ||
      $state.includes('dahlia.my-account') ||
      $state.includes('dahlia.my-applications')
        return 'center-body'

  $scope.focusOnMainContent = ->
    SharedService.focusOn('main-content')

  $scope.translateWelcomePath = ->
    translateWelcomeMap =
      'zh': 'welcome-chinese'
      'es': 'welcome-spanish'
      'en': 'welcome'
      'tl': 'welcome-filipino'

    stateName = translateWelcomeMap[$stateParams.lang]
    return "dahlia.#{stateName}({'#': 'translation-disclaimer'})"

############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedController.$inject = [
  '$scope', '$state', '$stateParams', '$window', 'SharedService', 'ExternalTranslateService'
]

angular
  .module('dahlia.controllers')
  .controller('SharedController', SharedController)
