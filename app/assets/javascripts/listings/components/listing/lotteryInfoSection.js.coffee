angular.module('dahlia.components')
.component 'lotteryInfoSection',
  templateUrl: 'listings/components/listing/lottery-info-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingDataService', 'ListingLotteryService', '$window', (ListingDataService, ListingLotteryService, $window) ->
    ctrl = @

    @showPreLotteryInfo = $window.env.showPreLotteryInfo == 'true'

    @loading = ListingLotteryService.loading

    @listingHasLotteryResults = ->
      ListingLotteryService.listingHasLotteryResults(this.parent.listing)

    @openLotteryResultsModal = () ->
      ListingLotteryService.openLotteryResultsModal()

    @showLotteryResultsModalButton = ->
      ListingLotteryService.listingHasLotteryBuckets(this.parent.listing)

    @showDownloadLotteryResultsButton = ->
      !@loading.lotteryResults && this.parent.listing.LotteryResultsURL &&
      !ListingLotteryService.listingHasLotteryBuckets(this.parent.listing)

    @lotteryComplete = ->
      ListingLotteryService.lotteryComplete(this.parent.listing)

    return ctrl
  ]
