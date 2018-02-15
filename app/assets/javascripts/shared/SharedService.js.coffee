############################################################################################
####################################### SERVICE ############################################
############################################################################################

SharedService = ($http, $state, $window, $document) ->
  Service = {}
  Service.alternateLanguageLinks = []
  Service.assetPaths = STATIC_ASSET_PATHS
  Service.housingCounselors =
    all: []
    chinese: []
    filipino: []
    spanish: []
  # email regex source: https://web.archive.org/web/20080927221709/http://www.regular-expressions.info/email.html
  # using an RFC 2822 compliant regex, not RFC 5322, in order to match Salesforce's email regex which complies w/ 2822
  Service.emailRegex = new RegExp([
    "[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+)*",
    '@',
    '(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?'
  ].join(''))
  Service.languageMap =
    en: 'English'
    es: 'Spanish'
    tl: 'Filipino'
    zh: 'Chinese'

  Service.isWelcomePage = (state = null) ->
    if state
      !!state.name.match /dahlia\.welcome-[a-z]+$/
    else
      $state.includes('dahlia.welcome-chinese') || $state.includes('dahlia.welcome-spanish') || $state.includes('dahlia.welcome-filipino')

  Service.getWelcomePageLanguage = (stateName) ->
    welcomePageLanguage =
      longName: ''
      shortName: ''

    if stateName
      matches = stateName.match(/(.*welcome-)([a-z]+$)/)
      if matches
        longName = matches[2]
        shortName = _.invert(Service.languageMap)[longName.charAt(0).toUpperCase() + longName.slice(1)]
        welcomePageLanguage.longName = longName
        welcomePageLanguage.shortName = shortName

    return welcomePageLanguage

  Service.showSharing = () ->
    $state.current.name == "dahlia.favorites"

  # method adapted from:
  # https://www.bignerdranch.com/blog/web-accessibility-skip-navigation-links
  Service.focusOn = (id) ->
    toFocus = document.getElementById(id)
    return unless toFocus
    angularElement = angular.element(toFocus)
    Service.focusOnElement(angularElement)
    $document.scrollToElement(angularElement)

  Service.focusOnElement = (el) ->
    return unless el
    # Setting 'tabindex' to -1 takes an element out of normal tab flow
    # but allows it to be focused via javascript
    el.attr 'tabindex', -1
    el.on 'blur focusout', ->
      # when focus leaves this element, remove the tabindex
      angular.element(@).removeAttr('tabindex')
    el[0].focus()

  Service.focusOnBody = ->
    body = angular.element(document.body)
    Service.focusOnElement(body)

  Service.updateAlternateLanguageLinks = ->
    angular.copy([], Service.alternateLanguageLinks)
    currentState = $state.current.name
    _.each ['en', 'es', 'tl', 'zh'], (lang) ->
      params = _.merge(angular.copy($state.current.params), {lang: lang})
      # because the homepage 'en' route gives a blank result when using {absolute: true}
      # we just use the relative href and append to the root_url printed by Rails in application.html
      href = $state.href($state.current.name, params)
      Service.alternateLanguageLinks.push(
        lang: lang
        href: href.slice(1)
      )
  Service.getHousingCounselors = ->
    housingCounselorJsonPath = Service.assetPaths['housing_counselors.json']
    # if we've already loaded this asset, no need to reload
    return if Service.housingCounselors.loaded == housingCounselorJsonPath
    $http.get(housingCounselorJsonPath).success((data, status, headers, config) ->
      Service.housingCounselors.all = data.locations
      Service.housingCounselors.loaded = housingCounselorJsonPath
      Service.housingCounselors.chinese = _.filter data.locations, (o) ->
        _.includes o.languages, 'Cantonese'
      Service.housingCounselors.filipino = _.filter data.locations, (o) ->
        _.includes o.languages, 'Filipino'
      Service.housingCounselors.spanish = _.filter data.locations, (o) ->
        _.includes o.languages, 'Spanish'
    )

  Service.onDocChecklistPage = ->
    $state.current.name == "dahlia.document-checklist"

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedService.$inject = ['$http', '$state', '$window', '$document']

angular
  .module('dahlia.services')
  .service('SharedService', SharedService)
