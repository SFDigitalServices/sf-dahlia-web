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
        $translate.instant('listings.showing_matches_for_sale')
      else if @tenureType == 'rental'
        $translate.instant('listings.showing_matches_for_rent')

    @noMatchesLabel = () ->
      if @tenureType == 'ownership'
        $translate.instant('listings.you_dont_match_any_sale')
      else if @tenureType == 'rental'
        $translate.instant('listings.you_dont_match_any_rent')

    return ctrl
  ]
