# mock globals
STATIC_ASSET_PATHS
do ->
  'use strict'
  describe 'SharedService', ->
    SharedService = undefined
    httpBackend = undefined
    $state = undefined
    $window = undefined
    $document = undefined
    languageMap: {es: 'Spanish'}

    beforeEach module('ui.router')
    beforeEach module('dahlia.services', ($provide) ->
    )

    beforeEach inject((_SharedService_, _$httpBackend_, _$state_, _$window_, _$document_) ->
      httpBackend = _$httpBackend_
      $state = _$state_
      $window = _$window_
      $document = _$document_
      SharedService = _SharedService_
      return
    )

    describe 'getLanguageCode', ->
      it 'returns the 2-letter code for the given language name', ->
        code = SharedService.getLanguageCode('Spanish')
        expect(code).toEqual 'es'

    describe 'getLanguageName', ->
      it 'returns the full name for the given language code', ->
        name = SharedService.getLanguageName('es')
        expect(name).toEqual 'Spanish'
