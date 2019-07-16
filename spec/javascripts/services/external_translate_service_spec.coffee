do ->
  'use strict'
  describe 'ExternalTranslateService', ->
    ExternalTranslateService = undefined
    $q = undefined
    $timeout = undefined
    $rootScope = undefined
    $window = undefined
    $timeout = jasmine.createSpy()
    callbackFunction = undefined
    promise = undefined
    dummyScriptElement = document.createElement('script')
    dummyHeadElement = document.createElement('head')

    beforeEach module('dahlia.services', ($provide) ->)

    beforeEach inject((_$q_, _$rootScope_, _$window_, _ExternalTranslateService_) ->
      ExternalTranslateService = _ExternalTranslateService_
      $q = _$q_
      $rootScope = _$rootScope_
      $window = _$window_
      $window.google =
        translate:
          foo: 'bar'
      return
    )

    describe 'loadAPI', ->
      beforeEach ->
        ExternalTranslateService.loadScript = jasmine.createSpy()

      describe 'if the translation service has not already been loaded', ->
        beforeEach ->
          ExternalTranslateService.loaded = false

        it "sets up the callback function for the translation script", ->
          ExternalTranslateService.loadAPI()
          initFunction = $window['initGoogleTranslate']
          expect($window['initGoogleTranslate']).toEqual(jasmine.any(Function))

        describe 'the callback function', ->
          beforeEach ->
            promise = ExternalTranslateService.loadAPI()
            callbackFunction = window['initGoogleTranslate']
            ExternalTranslateService.init = jasmine.createSpy()
            callbackFunction()

          it 'calls Service.init', ->
            expect(ExternalTranslateService.init).toHaveBeenCalled()

          it 'sets Service.loaded to true', ->
            expect(ExternalTranslateService.loaded).toEqual(true)

          it "resolves the deferred's promise with window.google.translate", ->
            promiseResultValue = 'something'
            promise.then(
              (result) -> promiseResultValue = result,
              (result) -> promiseResultValue = 'promise rejected'
            )
            $rootScope.$apply()
            expect(promiseResultValue).toEqual(window.google.translate)

        it 'calls Service.loadScript', ->
          ExternalTranslateService.loadAPI()
          expect(ExternalTranslateService.loadScript).toHaveBeenCalled()

      describe 'if the translation service has already been loaded', ->
        beforeEach ->
          ExternalTranslateService.loaded = true

        it "resolves the deferred's promise with an undefined value", ->
          promise = ExternalTranslateService.loadAPI()
          promiseResultValue = 'something'
          promise.then(
            (result) -> promiseResultValue = result,
            (result) -> promiseResultValue = 'promise rejected'
          )
          $rootScope.$apply()
          expect(typeof promiseResultValue).toEqual('undefined')

      it 'returns a promise', ->
        promise = ExternalTranslateService.loadAPI()
        expect(typeof promise.then).toEqual('function')

    describe 'loadScript', ->
      beforeEach ->
        spyOn(document, 'createElement').and.returnValue(dummyScriptElement)
        spyOn(document, 'getElementsByTagName').and.returnValue([dummyHeadElement])
        ExternalTranslateService.URL = 'foo'

      afterEach ->
        ExternalTranslateService.URL = null

      it 'adds a script tag with the service\'s URL to the page head', ->
        ExternalTranslateService.loadScript()
        expect(dummyHeadElement.childNodes[0]).toBe(dummyScriptElement)
        expect(dummyHeadElement.childNodes[0].getAttribute('type'))
          .toEqual('text/javascript')
        expect(dummyHeadElement.childNodes[0].getAttribute('src'))
          .toEqual(ExternalTranslateService.URL)

    describe 'setLanguage', ->
      describe 'if the given language is "zh"', ->
        it 'sets Service.language to "zh-TW"', ->
          ExternalTranslateService.setLanguage('zh')
          expect(ExternalTranslateService.language).toEqual('zh-TW')

      describe 'if the given language is anything other than "zh"', ->
        it 'sets Service.language to the given language', ->
          ExternalTranslateService.setLanguage('es')
          expect(ExternalTranslateService.language).toEqual('es')

    describe 'translatePageContent', ->
      beforeEach ->
        ExternalTranslateService.init = jasmine.createSpy()

      it 'attempts to find the external translate widget DOM element that corresponds to Service.language', ->
        spyOn(document, 'querySelector')
        ExternalTranslateService.language = 'es'
        selector = ".goog-te-combo option[value=\"#{ExternalTranslateService.language}\"]"
        ExternalTranslateService.translatePageContent()
        expect(document.querySelector).toHaveBeenCalledWith(selector)

      describe 'if the element is found', ->
        element =
          dispatchEvent: jasmine.createSpy()
        eventType = 'change'
        bubbles = true
        cancelable = true
        changeEvent =
          initEvent: jasmine.createSpy()

        beforeEach ->
          spyOn(document, 'querySelector').and.returnValue(element)
          spyOn(document, 'createEvent').and.returnValue(changeEvent)

        it "sets the element's selected property to true", ->
          ExternalTranslateService.translatePageContent()
          expect(element.selected).toEqual(true)

        # describe 'if $window.Event is a function', ->
        #   # this generally means the browser is something other than IE
        #
        #   it 'uses a modern event creation syntax to create a change event', ->

        describe 'if $window.Event is not a function', ->
          # this generally means the browser is IE
          it 'uses an older event creation syntax to create a change event', ->
            $window.Event = null
            ExternalTranslateService.translatePageContent()
            expect(document.createEvent).toHaveBeenCalled()
            expect(changeEvent.initEvent).toHaveBeenCalledWith(eventType, bubbles, cancelable)

        it 'dispatches a change event to the element', ->
          # WIP
          $window.Event = jasmine.createSpy().and.returnValue(changeEvent)
          ExternalTranslateService.translatePageContent()
          expect(element.dispatchEvent).toHaveBeenCalledWith(changeEvent)

      # describe 'if the element is not found', ->
      #    it 'sets a timeout to try again in 25ms', ->

    #describe 'init', ->
      #it 'is not yet tested', ->
