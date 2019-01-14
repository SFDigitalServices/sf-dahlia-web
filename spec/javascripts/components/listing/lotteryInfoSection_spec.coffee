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
      listingHasLotteryBuckets: ->

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

      describe '$ctrl.showLotteryResultsModalButton', ->
        it 'calls ListingService.listingHasLotteryBuckets', ->
          spyOn(fakeListingService, 'listingHasLotteryBuckets')
          ctrl.showLotteryResultsModalButton()
          expect(fakeListingService.listingHasLotteryBuckets).toHaveBeenCalled()

      describe '$ctrl.showDownloadLotteryResultsButton', ->
        it 'calls ListingService.listingHasLotteryBuckets', ->
          spyOn(fakeListingService, 'listingHasLotteryBuckets')
          ctrl.showDownloadLotteryResultsButton()
          expect(fakeListingService.listingHasLotteryBuckets).toHaveBeenCalled()
        it 'returns false if listing has buckets', ->
          spyOn(fakeListingService, 'listingHasLotteryBuckets').and.returnValue(true)
          expect(ctrl.showDownloadLotteryResultsButton()).toEqual false
        it 'returns true if listing is missing buckets', ->
          spyOn(fakeListingService, 'listingHasLotteryBuckets').and.returnValue(false)
          expect(ctrl.showDownloadLotteryResultsButton()).toEqual true