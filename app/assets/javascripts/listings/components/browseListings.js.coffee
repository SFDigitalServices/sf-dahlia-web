angular.module('dahlia.components')
.component 'browseListings',
  templateUrl: 'listings/components/browse-listings.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', 'ListingHelperService', 'SharedService', '$state', (ListingService, ListingHelperService, SharedService, $state) ->
    ctrl = @

    @eligibilityFilters = ListingService.eligibility_filters
    @openMatchListings = ListingService.openMatchListings
    @openListings = ListingService.openListings
    @openNotMatchListings = ListingService.openNotMatchListings
    @closedListings = ListingService.closedListings
    @lotteryResultsListings = ListingService.lotteryResultsListings

    @clearEligibilityFilters = ->
      ListingService.resetEligibilityFilters()
      IncomeCalculatorService.resetIncomeSources()

    @isOpenMatchListing = (listing) ->
      @openMatchListings.indexOf(listing) > -1

    return ctrl
  ]
