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
      !@loading.lotteryResults && this.parent.listing.LotteryResultsURL &&
      !ListingLotteryService.listingHasLotteryBuckets(this.parent.listing)

    @lotteryComplete = ->
      ListingLotteryService.lotteryComplete(this.parent.listing)

    @leasingAgentInfoAvailable = ->
      l = this.parent.listing
      l.Leasing_Agent_Phone || l.Leasing_Agent_Email || l.Leasing_Agent_Street

    return ctrl
  ]
