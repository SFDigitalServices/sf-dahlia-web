do ->
  'use strict'
  describe 'Open Hours Section Component', ->
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
    fakeListingDataService =
        listings: fakeListings
        sortByDate: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingDataService: fakeListingDataService
        $translate: $translate
      }
    )

    describe 'openHoursSection', ->
      beforeEach ->
        ctrl = $componentController 'openHoursSection', locals, {parent: fakeParent}

      describe 'sortedOpenHouses', ->
        it 'calls ListingDataService.sortByDate', ->
          ctrl.sortedOpenHouses()
          expect(fakeListingDataService.sortByDate).toHaveBeenCalledWith(ctrl.parent.listing.Open_Houses)
