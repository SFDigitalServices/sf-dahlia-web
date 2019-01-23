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

    describe 'processSection', ->
      beforeEach ->
        ctrl = $componentController 'processSection', locals, {parent: fakeParent}

      describe 'sortedInformationSessions', ->
        it 'calls ListingDataService.sortByDate', ->
          ctrl.sortedInformationSessions()
          expect(fakeListingDataService.sortByDate).toHaveBeenCalledWith(ctrl.parent.listing.Information_Sessions)

      describe 'sortedOpenHouses', ->
        it 'calls ListingDataService.sortByDate', ->
          ctrl.sortedOpenHouses()
          expect(fakeListingDataService.sortByDate).toHaveBeenCalledWith(ctrl.parent.listing.Open_Houses)
