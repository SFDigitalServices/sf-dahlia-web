do ->
  'use strict'
  describe 'Panel Apply Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $translate =
      instant: ->
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeParent = {
      listing: fakeListing
    }
    fakeListingService =
      listings: fakeListings
    fakeShortFormApplicationService =
      getLanguageCode: jasmine.createSpy()
    fakeAnalyticsService = {}
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        ShortFormApplicationService: fakeShortFormApplicationService
        AnalyticsService: fakeAnalyticsService
      }
    )

    describe 'panelApply', ->
      beforeEach ->
        ctrl = $componentController 'panelApply', locals, {parent: fakeParent}

      describe 'getLanguageCode', ->
        it 'expects getLanguageCode to be called on ShortFormApplicationService', ->
          fakeApplication = {applicationLanguage: 'Spanish'}
          ctrl.getLanguageCode(fakeApplication)
          expect(fakeShortFormApplicationService.getLanguageCode).toHaveBeenCalledWith(fakeApplication)

      describe '$ctrl.toggleApplicationOptions', ->
        it 'toggles showApplicationOptions', ->
          ctrl.showApplicationOptions = false
          ctrl.toggleApplicationOptions()
          expect(ctrl.showApplicationOptions).toEqual true