do ->
  'use strict'
  describe 'AnalyticsService', ->

    AnalyticsService = undefined
    $state =
      current: { url: ''}
      href: ->
      go: ->
    window.dataLayer =
      push: jasmine.createSpy()
    window.ga = jasmine.createSpy()

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value '$state', $state
      # $provide.value 'window.dataLayer', dataLayer
      return
    )

    beforeEach inject((_AnalyticsService_) ->
      AnalyticsService = _AnalyticsService_
      return
    )

    describe 'Service.trackEvent', ->
      it 'calls GTM function dataLayer.push', ->
        event = 'myEvent'
        props = { category: 'xyz' }
        $state.current.url = '/my-path'
        AnalyticsService.trackEvent(event, props)
        props.label = 'my-path'
        expect(dataLayer.push).toHaveBeenCalledWith(props)

    describe 'Service.trackCurrentPage', ->
      it 'calls analytics function ga("send")', ->
        $state.current.url = '/my-path'
        AnalyticsService.trackCurrentPage()
        expect(ga).toHaveBeenCalledWith('send', 'pageview')

    describe 'Service.trackTimerEvent', ->
      it 'calls GTM function as long as valid timer had been started', ->
        category = 'Application'
        variable = 'Timer'
        label = 'Apply'
        AnalyticsService.startTimer(label: label)
        AnalyticsService.trackTimerEvent(category, label, variable)
        expect(dataLayer.push).toHaveBeenCalled()
