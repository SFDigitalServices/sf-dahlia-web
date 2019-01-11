angular.module('dahlia.components')
.component 'browseListings',
  templateUrl: 'listings/components/browse-listings.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', 'ListingHelperService', 'SharedService', 'IncomeCalculatorService', '$state', (ListingService, ListingHelperService, SharedService, IncomeCalculatorService, $state) ->
    ctrl = @

    @eligibilityFilters = ListingService.eligibility_filters
    @openMatchListings = ListingService.openMatchListings

    @clearEligibilityFilters = ->
      ListingService.resetEligibilityFilters()
      IncomeCalculatorService.resetIncomeSources()

    return ctrl
  ]
