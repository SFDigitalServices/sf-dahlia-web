angular.module('dahlia.components')
.component 'browseListings',
  templateUrl: 'listings/components/browse-listings.html'
  require:
    parent: '^listingContainer'
  bindings:
    tenureType: '@'
  controller: ['$state', '$translate', 'IncomeCalculatorService', 'ListingDataService', 'ListingEligibilityService',
  ($state, $translate, IncomeCalculatorService, ListingDataService, ListingEligibilityService) ->
    ctrl = @

    @eligibilityFilters = ListingEligibilityService.eligibility_filters
    @openMatchListings = ListingDataService.openMatchListings

    @clearEligibilityFilters = ->
      ListingEligibilityService.resetEligibilityFilters()
      IncomeCalculatorService.resetIncomeSources()

    @headerText = (listingType) ->
      listingTypeTranslation = $translate.instant('LISTINGS.' + listingType.toUpperCase())
      interpolate = { listingsType: listingTypeTranslation }
      $translate.instant('LISTINGS.SHOWING_MATCHES_FOR', interpolate)


    return ctrl
  ]
