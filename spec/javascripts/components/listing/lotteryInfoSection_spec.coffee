do ->
  'use strict'
  describe 'Lottery Info Section Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeParent = {
      listing: fakeListing
    }
    fakeListingService =
      listings: fakeListings
      listingHasLotteryResults: jasmine.createSpy()
      openLotteryResultsModal: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
      }
    )

    describe 'lotteryInfoSection', ->
      beforeEach ->
        ctrl = $componentController 'lotteryInfoSection', locals, {parent: fakeParent}

      describe 'listingHasLotteryResults', ->
        it 'calls ListingService.listingHasLotteryResults', ->
          ctrl.listingHasLotteryResults()
          expect(fakeListingService.listingHasLotteryResults).toHaveBeenCalled()
      describe 'openLotteryResultsModal', ->
        it 'expect ListingService.openLotteryResultsModal to be called', ->
          ctrl.openLotteryResultsModal()
          expect(fakeListingService.openLotteryResultsModal).toHaveBeenCalled()