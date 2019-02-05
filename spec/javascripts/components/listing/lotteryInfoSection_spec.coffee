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
    fakeListingDataService =
      listings: fakeListings
    fakeListingLotteryService =
      listingHasLotteryBuckets: ->
      listingHasLotteryResults: jasmine.createSpy()
      lotteryComplete: ->
      openLotteryResultsModal: jasmine.createSpy()
      loading: { lotteryResults: false }

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingDataService: fakeListingDataService
        ListingLotteryService: fakeListingLotteryService
      }
    )

    describe 'lotteryInfoSection', ->
      beforeEach ->
        ctrl = $componentController 'lotteryInfoSection', locals, {parent: fakeParent}

      describe 'listingHasLotteryResults', ->
        it 'calls ListingLotteryService.listingHasLotteryResults', ->
          ctrl.listingHasLotteryResults()
          expect(fakeListingLotteryService.listingHasLotteryResults).toHaveBeenCalled()

      describe 'openLotteryResultsModal', ->
        it 'expect ListingLotteryService.openLotteryResultsModal to be called', ->
          ctrl.openLotteryResultsModal()
          expect(fakeListingLotteryService.openLotteryResultsModal).toHaveBeenCalled()

      describe '$ctrl.showLotteryResultsModalButton', ->
        it 'calls ListingLotteryService.listingHasLotteryBuckets', ->
          spyOn(fakeListingLotteryService, 'listingHasLotteryBuckets')
          ctrl.showLotteryResultsModalButton()
          expect(fakeListingLotteryService.listingHasLotteryBuckets).toHaveBeenCalled()

      describe '$ctrl.showDownloadLotteryResultsButton', ->
        it 'calls ListingLotteryService.listingHasLotteryBuckets', ->
          spyOn(fakeListingLotteryService, 'listingHasLotteryBuckets')
          ctrl.showDownloadLotteryResultsButton()
          expect(fakeListingLotteryService.listingHasLotteryBuckets).toHaveBeenCalled()
        it 'returns false if listing has buckets', ->
          spyOn(fakeListingLotteryService, 'listingHasLotteryBuckets').and.returnValue(true)
          expect(ctrl.showDownloadLotteryResultsButton()).toEqual false
        it 'returns true if listing is missing buckets', ->
          spyOn(fakeListingLotteryService, 'listingHasLotteryBuckets').and.returnValue(false)
          expect(ctrl.showDownloadLotteryResultsButton()).toEqual true
        it 'returns false if loading', ->
          fakeListingLotteryService.loading.lotteryResults = true
          spyOn(fakeListingLotteryService, 'listingHasLotteryBuckets').and.returnValue(false)
          expect(ctrl.showDownloadLotteryResultsButton()).toEqual false
