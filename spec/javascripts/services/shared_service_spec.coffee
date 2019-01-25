do ->
  'use strict'
  describe 'SharedService', ->
    SharedService = undefined
    httpBackend = undefined
    $state = undefined
    $window = undefined
    $document = undefined

    beforeEach module('ui.router')
    beforeEach module('dahlia.services', ($provide) ->
    )

    beforeEach inject((_SharedService_, _$httpBackend_, _$state_, _$window_, _$document_) ->
      httpBackend = _$httpBackend_
      $state = _$state_
      $window = _$window_
      $window.STATIC_ASSET_PATHS = {}
      $document = _$document_
      SharedService = _SharedService_
      return
    )

    describe 'getLanguageCode', ->
      it 'returns the 2-letter code for a given language name', ->
        Object.keys(SharedService.languageMap).forEach (key) ->
          languageName = SharedService.languageMap[key]
          languageCode = SharedService.getLanguageCode(languageName)
          expect(languageCode).toEqual key

      it 'returns the 2-letter code for a given language name that is not in capitalization case', ->
        Object.keys(SharedService.languageMap).forEach (key) ->
          lowercaseLanguageName = SharedService.languageMap[key].toLowerCase()
          languageCode = SharedService.getLanguageCode(lowercaseLanguageName)
          expect(languageCode).toEqual key

        Object.keys(SharedService.languageMap).forEach (key) ->
          uppercaseLanguageName = SharedService.languageMap[key].toUpperCase()
          languageCode = SharedService.getLanguageCode(uppercaseLanguageName)
          expect(languageCode).toEqual key

    describe 'getLanguageName', ->
      it 'returns the full name for the given language code', ->
        Object.keys(SharedService.languageMap).forEach (key) ->
          languageName = SharedService.getLanguageName(key)
          expect(languageName).toEqual SharedService.languageMap[key]

    describe 'toQueryString', ->
      it 'returns a query-string-formatted version of the given params', ->
        params = {foo: 1, bar: 2}
        queryString = 'foo=1&bar=2'
        expect(SharedService.toQueryString(params)).toEqual queryString
