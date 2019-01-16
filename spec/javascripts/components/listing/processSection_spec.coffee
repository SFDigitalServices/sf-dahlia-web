do ->
  'use strict'
  describe 'Process Section Component', ->
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
        sortByDate: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        $translate: $translate
      }
    )

    describe 'processSection', ->
      beforeEach ->
        ctrl = $componentController 'processSection', locals, {parent: fakeParent}

      describe 'sortedInformationSessions', ->
        it 'calls ListingService.sortByDate', ->
          ctrl.sortedInformationSessions()
          expect(fakeListingService.sortByDate).toHaveBeenCalledWith(ctrl.parent.listing.Information_Sessions)

      describe 'sortedOpenHouses', ->
        it 'calls ListingService.sortByDate', ->
          ctrl.sortedOpenHouses()
          expect(fakeListingService.sortByDate).toHaveBeenCalledWith(ctrl.parent.listing.Open_Houses)