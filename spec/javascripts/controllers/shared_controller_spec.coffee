do ->
  'use strict'
  describe 'SharedController alert message', ->
    createController = undefined

    beforeEach module('dahlia.controllers')

    beforeEach inject(($rootScope, $controller, $q) ->
      createController = (topMessage, requiredLoginsDate, locale) ->
        scope = $rootScope.$new()
        fakeTranslate = jasmine.createSpy('translate').and.callFake((message) -> $q.when(message))
        fakeTranslate.use = -> locale
        fakeTranslate.onReady = (callback) -> callback()

        $controller('SharedController',
          $scope: scope
          $rootScope: $rootScope
          $state:
            includes: -> false
            params: {}
          $stateParams: {}
          $window:
            TOP_MESSAGE: topMessage
            REQUIRED_LOGINS_DATE: requiredLoginsDate
            env: {}
          $translate: fakeTranslate
          SharedService:
            assetPaths: {}
            housingCounselors: []
            alternateLanguageLinks: {}
          ExternalTranslateService: {}
        )
        $rootScope.$digest()
        {scope: scope, translate: fakeTranslate}
      return
    )

    it 'localizes the date and replaces the account link', ->
      {scope, translate} = createController('Starts date and follow the link.', '2026-12-12', 'es')
      expectedDate = new Intl.DateTimeFormat('es', {
        year: 'numeric'
        month: 'long'
        day: 'numeric'
      }).format(new Date(2026, 11, 12))
      expectedMessage = "Starts #{expectedDate} and follow the <a href=\"/create-account\">create an account</a>."

      expect(translate).toHaveBeenCalledWith(expectedMessage)
      expect(scope.alertMessage).toEqual(expectedMessage)

    it 'leaves the date keyword unchanged when no date is configured', ->
      {scope, translate} = createController('Starts date.', undefined, 'en')

      expect(translate).toHaveBeenCalledWith('Starts date.')
      expect(scope.alertMessage).toEqual('Starts date.')

    it 'keeps an invalid configured date unchanged', ->
      {scope, translate} = createController('Starts date.', 'not-a-date', 'en')

      expect(translate).toHaveBeenCalledWith('Starts not-a-date.')
      expect(scope.alertMessage).toEqual('Starts not-a-date.')

    it 'does not change a message without the date keyword', ->
      {scope, translate} = createController('No placeholder here.', '2026-12-12', 'en')

      expect(translate).toHaveBeenCalledWith('No placeholder here.')
      expect(scope.alertMessage).toEqual('No placeholder here.')