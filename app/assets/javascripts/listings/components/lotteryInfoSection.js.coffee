angular.module('dahlia.components')
.component 'lotteryInfoSection',
  templateUrl: 'listings/components/lottery-info-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', 'ListingLotteryService', (ListingService, ListingLotteryService) ->
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

    @leasingAgentInfoAvailable = ->
      l = this.parent.listing
      l.Leasing_Agent_Phone || l.Leasing_Agent_Email || l.Leasing_Agent_Street

    return ctrl
  ]
