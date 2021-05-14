ExternalTranslateService = ($q, $timeout, $window) ->
  Service = {}
  Service.URL = '//translate.google.com/translate_a/element.js?cb=initGoogleTranslate'
  Service.translateElement = {}
  Service.loaded = false
  Service.language = 'en'

  Service.loadAPI = ->
    deferred = $q.defer()
    unless Service.loaded
      $window['initGoogleTranslate'] = ->
        Service.init()
        Service.loaded = true
        deferred.resolve($window.google.translate)
      Service.loadScript()
    else
      deferred.resolve()

    deferred.promise

  Service.loadScript = ->
    node = document.createElement('script')
    node.src = Service.URL
    node.type = 'text/javascript'
    document.getElementsByTagName('head')[0].appendChild(node)

  Service.setLanguage = (language) ->
    Service.language = if language == 'zh' then 'zh-TW' else language

  Service.translatePageContent = (iterationCount=15) ->
    googleTranslateOption = document.querySelector(".goog-te-combo option[value=\"#{Service.language}\"]")
    if googleTranslateOption
      googleTranslateOption.selected = true
      if typeof $window.Event == 'function'
        changeEvent = new $window.Event('change',
          'bubbles': true
          'cancelable': true
        )
      else
        # old style syntax to support IE 9+
        changeEvent = document.createEvent('Event')
        bubbles = true
        cancelable = true
        changeEvent.initEvent('change', bubbles, cancelable)
      googleTranslateOption.dispatchEvent(changeEvent)
    else
      # Default to 15 recursive calls, break the loop if it's not working.
      if iterationCount > 0
        Service.init()
        $timeout((() -> Service.translatePageContent(iterationCount - 1)), 50)
      else
        return false

  Service.init = ->
    Service.translateElement = new $window.google.translate.TranslateElement(
      pageLanguage: 'en'
      includedLanguages: 'en,es,tl,zh-TW'
      layout: $window.google.translate.TranslateElement.InlineLayout.HORIZONTAL
      autoDisplay: false
      multilanguagePage: true
      gaTrack: true
      gaId: 'UA-71549528-1'
    , 'google_translate_element')

  Service

ExternalTranslateService.$inject = ['$q', '$timeout', '$window']

angular
  .module('dahlia.services')
  .service('ExternalTranslateService', ExternalTranslateService)
