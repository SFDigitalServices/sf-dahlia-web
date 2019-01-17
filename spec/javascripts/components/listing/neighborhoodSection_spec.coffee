do ->
  'use strict'
  describe 'Neighborhood Section Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeParent = {
      listing: fakeListing
      formattedBuildingAddress: jasmine.createSpy()
    }
    fakeListingService =
      listings: fakeListings
    $sce = {
      trustAsResourceUrl: jasmine.createSpy()
    }

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        $sce: $sce
      }
    )

    describe 'neighborhoodSection', ->
      beforeEach ->
        ctrl = $componentController 'neighborhoodSection', locals, {parent: fakeParent}

      describe 'listingHasLotteryResults', ->
        it 'calls $sce.trustAsResourceUrl', ->
          ctrl.googleMapSrc()
          expect($sce.trustAsResourceUrl).toHaveBeenCalled()