############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

SharedController = ($scope, $state, $stateParams, $window, SharedService, ExternalTranslateService) ->
  $scope.assetPaths = SharedService.assetPaths
  $scope.housingCounselors = SharedService.housingCounselors
  $scope.alternateLanguageLinks = SharedService.alternateLanguageLinks

  $scope.doNotGoogleTranslate = ->
    $scope.isShortFormPage() || $scope.isWelcomePage() || $scope.isEnglish()

  $scope.isShortFormPage = ->
    $state.includes('dahlia.short-form-welcome') || $state.includes('dahlia.short-form-application')

  $scope.isWelcomePage = ->
    SharedService.isWelcomePage()

  $scope.isEnglish = ->
    $state.params.lang == 'en'

  $scope.feedbackUrl = "https://airtable.com/appUW1tM8te0Lmf6q/pagyZulZJCm1V4G8D/form?prefill_source=#{encodeURIComponent(window.location.pathname)}&hide_source=true"

  $scope.researchUrl = $window.env.researchFormUrl

  $scope.listingEmailAlertUrl = "https://confirmsubscription.com/h/y/C3BAFCD742D47910"

  $scope.alertMessage = if $window.TOP_MESSAGE then _.unescape($window.TOP_MESSAGE) else ''

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
