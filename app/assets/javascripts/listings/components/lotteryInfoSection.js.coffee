angular.module('dahlia.components')
.component 'lotteryInfoSection',
  templateUrl: 'listings/components/lottery-info-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingDataService', 'ListingLotteryService', (ListingDataService, ListingLotteryService) ->
    ctrl = @

    @loading = ListingLotteryService.loading

    @listingHasLotteryResults = ->
      ListingLotteryService.listingHasLotteryResults(this.parent.listing)

    @openLotteryResultsModal = () ->
      ListingLotteryService.openLotteryResultsModal()

    @showLotteryResultsModalButton = ->
      ListingLotteryService.listingHasLotteryBuckets(this.parent.listing)

    @showDownloadLotteryResultsButton = ->
      this.parent.listing.LotteryResultsURL && !ListingLotteryService.listingHasLotteryBuckets(this.parent.listing)

    return ctrl
  ]
