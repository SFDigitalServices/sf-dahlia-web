angular.module('dahlia.components')
.component 'browseListings',
  templateUrl: 'listings/components/browse-listings.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingDataService', 'ListingEligibilityService', 'IncomeCalculatorService', '$state',
  (ListingDataService, ListingEligibilityService, IncomeCalculatorService, $state) ->
    ctrl = @

    @eligibilityFilters = ListingEligibilityService.eligibility_filters
    @openMatchListings = ListingDataService.openMatchListings

    @clearEligibilityFilters = ->
      ListingEligibilityService.resetEligibilityFilters()
      IncomeCalculatorService.resetIncomeSources()

    return ctrl
  ]
