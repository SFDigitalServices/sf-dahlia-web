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

    @headerText = () ->
      if @tenureType == 'ownership'
        $translate.instant('LISTINGS.SHOWING_MATCHES_FOR_SALE')
      else if @tenureType == 'rental'
        $translate.instant('LISTINGS.SHOWING_MATCHES_FOR_RENT')

    @noMatchesLabel = () ->
      if @tenureType == 'ownership'
        $translate.instant('LISTINGS.YOU_DONT_MATCH_ANY_SALE')
      else if @tenureType == 'rental'
        $translate.instant('LISTINGS.YOU_DONT_MATCH_ANY_RENT')

    return ctrl
  ]
