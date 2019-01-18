angular.module('dahlia.components')
.component 'browseListings',
  templateUrl: 'listings/components/browse-listings.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', 'ListingHelperService', 'SharedService', 'ListingEligibilityService', '$state',
  (ListingService, ListingHelperService, SharedService, ListingEligibilityService, $state) ->
    ctrl = @

    @eligibilityFilters = ListingEligibilityService.eligibility_filters
    @openMatchListings = ListingService.openMatchListings

    @clearEligibilityFilters = ->
      ListingEligibilityService.resetEligibilityFilters()
      IncomeCalculatorService.resetIncomeSources()

      return ctrl
  ]
