angular.module('dahlia.components')
.component 'rentalStats',
  templateUrl: 'listings/components/rental-stats.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^propertyCard'
  controller: ['$filter', '$translate', ($filter, $translate) ->
    ctrl = @

    @_getCurrencyString = (v) -> $filter('currency')(v, '$', 0)

    @_getCurrencyRange = (min, max) ->
      if min? && max? && min < max
        $translate.instant('listings.stats.currency_range', {
          currencyMinValue: @_getCurrencyString(min)
          currencyMaxValue: @_getCurrencyString(max)
        })
      else if min?
        @_getCurrencyString(min)
      else if max?
        @_getCurrencyString(max)
      else
        ""

    @rentRangeString = (unitSummary) ->
      return "" if !unitSummary
      @_getCurrencyRange(unitSummary.minMonthlyRent, unitSummary.maxMonthlyRent)

    @incomeRangeString = (unitSummary) ->
      return "" if !unitSummary

      # min income should be 0 when absoluteMinIncome is null.
      minIncome = unitSummary.absoluteMinIncome || 0
      @_getCurrencyRange(minIncome, unitSummary.absoluteMaxIncome)

    return ctrl
  ]