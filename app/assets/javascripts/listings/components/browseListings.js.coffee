angular.module('dahlia.components')
.component 'browseListings',
  templateUrl: 'listings/components/browse-listings.html'
  require:
    parent: '^listingContainer'
  bindings:
    tenureType: '@'
  controller: ['$filter', '$sce', '$state', '$translate', 'IncomeCalculatorService', 'ListingDataService', 'ListingEligibilityService',
  ($filter, $sce, $state, $translate, IncomeCalculatorService, ListingDataService, ListingEligibilityService) ->
    ctrl = @

    @eligibilityFilters = ListingEligibilityService.eligibility_filters
    @openMatchListings = ListingDataService.openMatchListings
    @href = $state.href

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

    @resultsHeader = () ->
      people = $translate.instant(if @eligibilityFilters.household_size == '1' then 'listings.person' else 'listings.people')
      header = [$translate.instant('listings.for_household_size', {size: @eligibilityFilters.household_size, people: people})]

      if @eligibilityFilters.children_under_6 && @eligibilityFilters.children_under_6 > 0
        children = $translate.instant(if @eligibilityFilters.children_under_6 == '1' then 't.child' else 't.children')
        header.push($translate.instant('listings.including_children', {number: @eligibilityFilters.children_under_6, children: children}))

      timeframe = $translate.instant('t.per_' + $filter('incomeTimeframe')(@eligibilityFilters.income_timeframe))
      income = $filter('currency')(@eligibilityFilters.income_total, '$', 0)
      header.push($translate.instant('listings.at_total_income', {income: income, per: timeframe}))

      return $sce.trustAsHtml(header.join(' '))

    return ctrl
  ]
