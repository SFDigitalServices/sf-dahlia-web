angular.module('dahlia.components')
.component 'lotteryInfo',
  templateUrl: 'listings/components/lottery-info.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', 'ListingHelperService', (ListingService, ListingHelperService) ->
    ctrl = @

    @lotteryDateVenueAvailable = (listing) ->
      (listing.Lottery_Date != undefined &&
          listing.Lottery_Venue != undefined && listing.Lottery_Street_Address != undefined)

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
