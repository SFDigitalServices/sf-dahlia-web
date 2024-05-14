############################################################################################
####################################### SERVICE ############################################
############################################################################################

SharedService = ($http, $state, $window, $document) ->
  Service = {}
  Service.alternateLanguageLinks = []
  Service.assetPaths = $window.STATIC_ASSET_PATHS || {}
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

  Service._appendLeadingSlash = (path) ->
    if path.startsWith("/") then path else "/" + path

  Service._addLanguageAndParamsToUrl = (languageCode, url) ->
    langString = if languageCode == "en" then "" else languageCode
    # TODO: When implementing any page with url search params, that should be handled here.
    Service._appendLeadingSlash(langString + url)

  Service.railsRoutedPages =
    'dahlia.welcome':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad && $window.HOME_PAGE_REACT is "true"
    'dahlia.listings-for-rent':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "/listings/for-rent")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad
    'dahlia.listings-for-sale':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "/listings/for-sale")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad
    'dahlia.listing':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "/listings/#{params.id}")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad
    'dahlia.redirect-home':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "")
      shouldRailsRoute: (isFirstLoad) -> true
    'dahlia.housing-counselors':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "/housing-counselors")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad
    'dahlia.get-assistance':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "/get-assistance")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad
    'dahlia.additional-resources':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "/additional-resources")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad
    'dahlia.document-checklist':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "/document-checklist")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad
    'dahlia.privacy':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "/privacy")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad
    'dahlia.disclaimer':
      buildUrl: (state, params) -> Service._addLanguageAndParamsToUrl(params.lang, "/disclaimer")
      shouldRailsRoute: (isFirstLoad) -> !isFirstLoad


  Service.getLanguageCode = (langName) ->
    # will take "English" and return "en", for example
    if langName
      _.invert(Service.languageMap)[_.capitalize(langName)]

  Service.getLanguageName = (langCode) ->
    # will take "en" and return "English", for example
    Service.languageMap[langCode]

  Service.isWelcomePage = (state = null) ->
    if state
      !!state.name.match /^dahlia\.welcome-[a-z]+$/
    else
      $state.includes('dahlia.welcome-chinese') || $state.includes('dahlia.welcome-spanish') || $state.includes('dahlia.welcome-filipino')

  Service.shouldRouteViaRails = (stateName, isFirstLoad) ->
    return false if Object.keys(Service.railsRoutedPages).indexOf(stateName) is -1

    return Service.railsRoutedPages[stateName].shouldRailsRoute(isFirstLoad)

  Service.buildUrl = (state, params) ->
    Service.railsRoutedPages[state.name].buildUrl(state, params)

  Service.getWelcomePageLanguage = (stateName) ->
    welcomePageLanguage =
      name: ''
      code: ''

    if stateName
      matches = stateName.match(/(.*welcome-)([a-z]+$)/)
      if matches
        welcomePageLanguage.name = matches[2]
        welcomePageLanguage.code = Service.getLanguageCode(matches[2])

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

  Service.toQueryString = (params) ->
    Object.keys(params).reduce(((a, k) ->
      a.push k + '=' + encodeURIComponent(params[k])
      a
    ), []).join '&'

  Service.showVeteransApplicationQuestion = (listing) ->
    $window.VETERANS_APPLICATION_QUESTION is 'true' &&
    !!listing.Listing_Lottery_Preferences &&
    _.some(listing.Listing_Lottery_Preferences, (pref) ->
      _.includes(pref?.Lottery_Preference?.Name?.toLowerCase(), "veteran")
    )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedService.$inject = ['$http', '$state', '$window', '$document']

angular
  .module('dahlia.services')
  .service('SharedService', SharedService)
