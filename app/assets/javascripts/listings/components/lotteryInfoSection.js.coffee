angular.module('dahlia.components')
.component 'lotteryInfoSection',
  templateUrl: 'listings/components/lottery-info-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', (ListingService) ->
    ctrl = @

    @listingHasLotteryResults = ->
      ListingService.listingHasLotteryResults()

    @openLotteryResultsModal = () ->
      ListingService.openLotteryResultsModal()

    @showLotteryResultsModalButton = ->
      ListingService.listingHasLotteryBuckets()

    @showDownloadLotteryResultsButton = ->
      this.parent.listing.LotteryResultsURL && !ListingService.listingHasLotteryBuckets()

    @leasingAgentInfoAvailable = ->
      l = this.parent.listing
      l.Leasing_Agent_Phone || l.Leasing_Agent_Email || l.Leasing_Agent_Street

    return ctrl
  ]
