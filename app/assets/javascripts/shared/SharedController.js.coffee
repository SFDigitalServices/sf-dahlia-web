############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

localizeDate = (dateString, locale) ->
  return '' unless dateString

  [year, month, day] = dateString.split('-')
  date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
  return dateString if isNaN(date.getTime())

  new Intl.DateTimeFormat(locale or 'en', {
    year: 'numeric'
    month: 'long'
    day: 'numeric'
  }).format(date)

SharedController = ($scope, $rootScope, $state, $stateParams, $window, $translate, SharedService, ExternalTranslateService) ->
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

  $scope.feedbackUrl = "https://airtable.com/appUW1tM8te0Lmf6q/pagyZulZJCm1V4G8D/form?prefill_Last+visited=#{encodeURIComponent(window.location.pathname)}&hide_Last+visited=true"

  $scope.researchUrl = $window.env.researchFormUrl

  $scope.listingEmailAlertUrl = "https://confirmsubscription.com/h/y/C3BAFCD742D47910"

  $scope.alertMessage = ''

  setAlertMessage = ->
    topMessage = if $window.TOP_MESSAGE then _.unescape($window.TOP_MESSAGE) else ''
    return $scope.alertMessage = '' unless topMessage
    if topMessage.indexOf('date') isnt -1 and $window.REQUIRED_LOGINS_DATE
      topMessage = topMessage.replace(/date/g, localizeDate($window.REQUIRED_LOGINS_DATE, $translate.use()))
    topMessage = topMessage.replace(/link/g, '<a href="/create-account">create an account</a>') if topMessage.indexOf('link') isnt -1

    $translate(topMessage).then(
      (translatedMessage) ->
        $scope.alertMessage = translatedMessage
      ->
        $scope.alertMessage = topMessage
    )

  $translate.onReady(setAlertMessage)

  unsubscribeFromLanguageChanges = $rootScope.$on '$translateChangeSuccess', setAlertMessage

  $scope.$on '$destroy', ->
    unsubscribeFromLanguageChanges()

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
  '$scope', '$rootScope', '$state', '$stateParams', '$window', '$translate', 'SharedService', 'ExternalTranslateService'
]

angular
  .module('dahlia.controllers')
  .controller('SharedController', SharedController)
