do ->
  'use strict'
  describe 'Lottery Info Section Component', ->
    fakeWindow = {}
    fakeWindow['env'] = {showSaleListings: 'true', showPreLotteryInfo: 'true'}
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
        $window: fakeWindow
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
        it 'calls ListingLotteryService.openLotteryResultsModal', ->
          ctrl.openLotteryResultsModal()
          expect(fakeListingLotteryService.openLotteryResultsModal).toHaveBeenCalled()

      describe '$ctrl.showLotteryResultsModalButton', ->
        it 'calls ListingLotteryService.listingHasLotteryBuckets', ->
          spyOn(fakeListingLotteryService, 'listingHasLotteryBuckets')
          ctrl.showLotteryResultsModalButton()
          expect(fakeListingLotteryService.listingHasLotteryBuckets).toHaveBeenCalled()

      describe '$ctrl.showDownloadLotteryResultsButton', ->
        it 'returns false if listing has buckets', ->
          fakeListingLotteryService.loading.lotteryResults = false
          fakeParent.listing.LotteryResultsURL = 'foo'
          spyOn(fakeListingLotteryService, 'listingHasLotteryBuckets').and.returnValue(true)
          expect(ctrl.showDownloadLotteryResultsButton()).toEqual false

        it 'returns true if listing is missing buckets', ->
          fakeListingLotteryService.loading.lotteryResults = false
          fakeParent.listing.LotteryResultsURL = 'foo'
          spyOn(fakeListingLotteryService, 'listingHasLotteryBuckets').and.returnValue(false)
          expect(ctrl.showDownloadLotteryResultsButton()).toEqual true

        it 'returns false if loading', ->
          fakeListingLotteryService.loading.lotteryResults = true
          fakeParent.listing.LotteryResultsURL = 'foo'
          spyOn(fakeListingLotteryService, 'listingHasLotteryBuckets').and.returnValue(false)
          expect(ctrl.showDownloadLotteryResultsButton()).toEqual false
