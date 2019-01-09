angular.module('dahlia.components')
.component 'browseListings',
  templateUrl: 'listings/components/browse-listings.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', 'ListingHelperService', 'SharedService', '$state', (ListingService, ListingHelperService, SharedService, $state) ->
    ctrl = @

    @eligibilityFilters = ListingService.eligibility_filters
    @openMatchListings = ListingService.openMatchListings

    @clearEligibilityFilters = ->
      ListingService.resetEligibilityFilters()
      IncomeCalculatorService.resetIncomeSources()

    return ctrl
  ]
