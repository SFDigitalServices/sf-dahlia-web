do ->
  'use strict'
  describe 'SharedController alert message', ->
    createController = undefined

    beforeEach module('dahlia.controllers')

    beforeEach inject(($rootScope, $controller, $q) ->
      createController = (topMessage, requiredLoginsDate, locale) ->
        scope = $rootScope.$new()
        translationTemplate = "Starting {{date}}: If you don't have an account, <a href='{{link}}'>create one</a>."
        fakeTranslate = jasmine.createSpy('translate').and.callFake((message, values) ->
          translatedMessage = if message == 'nav.topMessageRequiredLogin' then translationTemplate else message
          translatedMessage = translatedMessage.replace('{{date}}', values.date)
          translatedMessage = translatedMessage.replace('{{link}}', values.link)
          $q.when(translatedMessage)
        )
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

    it 'interpolates a localized date and account link into the translated message', ->
      {scope, translate} = createController('nav.topMessageRequiredLogin', '2026-12-12', 'es')
      expectedDate = new Intl.DateTimeFormat('es', {
        month: 'long'
        day: 'numeric'
      }).format(new Date(2026, 11, 12))
      expectedMessage = "Starting #{expectedDate}: If you don't have an account, <a href='/create-account'>create one</a>."

      expect(translate).toHaveBeenCalledWith('nav.topMessageRequiredLogin', {
        date: expectedDate
        link: '/create-account'
      })
      expect(scope.alertMessage).toEqual(expectedMessage)

    it 'interpolates an empty date when no date is configured', ->
      {scope, translate} = createController('nav.topMessageRequiredLogin', undefined, 'en')

      expect(translate).toHaveBeenCalledWith('nav.topMessageRequiredLogin', {
        date: ''
        link: '/create-account'
      })
      expect(scope.alertMessage).toContain('Starting :')
      expect(scope.alertMessage).toContain("href='/create-account'")

    it 'localizes a month-name date string and omits its year', ->
      {scope, translate} = createController('nav.topMessageRequiredLogin', 'December 12, 2026', 'es')
      expectedDate = new Intl.DateTimeFormat('es', {
        month: 'long'
        day: 'numeric'
      }).format(new Date(2026, 11, 12))

      expect(translate).toHaveBeenCalledWith('nav.topMessageRequiredLogin', {
        date: expectedDate
        link: '/create-account'
      })
      expect(scope.alertMessage).toContain(expectedDate)
      expect(scope.alertMessage).not.toContain('2026')

    it 'keeps an invalid configured date unchanged', ->
      {scope, translate} = createController('nav.topMessageRequiredLogin', 'not-a-date', 'en')

      expect(translate).toHaveBeenCalledWith('nav.topMessageRequiredLogin', {
        date: 'not-a-date'
        link: '/create-account'
      })
      expect(scope.alertMessage).toContain('Starting not-a-date:')

    it 'does not change a message without the date keyword', ->
      {scope, translate} = createController('No placeholders here.', '2026-12-12', 'en')

      expect(translate).toHaveBeenCalledWith('No placeholders here.', {
        date: new Intl.DateTimeFormat('en', {
          month: 'long'
          day: 'numeric'
        }).format(new Date(2026, 11, 12))
        link: '/create-account'
      })
      expect(scope.alertMessage).toEqual('No placeholders here.')