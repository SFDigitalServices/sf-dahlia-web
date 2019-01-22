do ->
  'use strict'
  describe 'Panel Apply Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $translate =
      instant: ->
    fakeApplication = {
      applicationLanguage: 'Spanish'
      id: 1
      status: 'Submitted'
    }
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeParent = {
      listing: fakeListing
    }
    fakeListingService =
      listings: fakeListings
    fakeListingLotteryService =
      lotteryComplete: jasmine.createSpy()
    fakeShortFormApplicationService =
      getLanguageCode: jasmine.createSpy()
      application: fakeApplication
    fakeAnalyticsService = {
      trackTimerEvent: jasmine.createSpy()
    }
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        ListingLotteryService: fakeListingLotteryService
        ShortFormApplicationService: fakeShortFormApplicationService
        AnalyticsService: fakeAnalyticsService
      }
    )

    describe 'panelApply', ->
      beforeEach ->
        ctrl = $componentController 'panelApply', locals, {parent: fakeParent}

      describe 'getLanguageCode', ->
        it 'expects getLanguageCode to be called on ShortFormApplicationService', ->
          ctrl.getLanguageCode(fakeApplication)
          expect(fakeShortFormApplicationService.getLanguageCode).toHaveBeenCalledWith(fakeApplication)

      describe '$ctrl.toggleApplicationOptions', ->
        it 'toggles showApplicationOptions', ->
          ctrl.showApplicationOptions = false
          ctrl.toggleApplicationOptions()
          expect(ctrl.showApplicationOptions).toEqual true

      describe '$ctrl.submittedApplication', ->
        it 'returns true if application is submitted', ->
          expect(ctrl.submittedApplication()).toEqual true
        it 'returns false if application is not submitted', ->
          fakeApplication.status = 'any'
          expect(ctrl.submittedApplication()).toEqual false

      describe '$ctrl.hasDraftApplication', ->
        it 'returns true if application is drafted', ->
          fakeApplication.status = 'Draft'
          expect(ctrl.hasDraftApplication()).toEqual true
        it 'returns false if application is not drafted', ->
          fakeApplication.status = 'any'
          expect(ctrl.hasDraftApplication()).toEqual false

      describe '$ctrl.trackApplyOnlineTimer', ->
        it 'calls AnalyticsService.trackTimerEvent', ->
          ctrl.trackApplyOnlineTimer()
          expect(fakeAnalyticsService.trackTimerEvent).toHaveBeenCalledWith('Application', 'Apply Online Click')

      describe '$ctrl.lotteryComplete', ->
        it 'calls ListingLotteryService.lotteryComplete', ->
          ctrl.lotteryComplete(fakeListing)
          expect(fakeListingLotteryService.lotteryComplete).toHaveBeenCalledWith(fakeListing)
