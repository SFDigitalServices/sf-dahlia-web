angular.module('dahlia.components')
.component 'saleStats',
  templateUrl: 'listings/components/sale-stats.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^propertyCard'
  controller: ['$filter', '$translate', ($filter, $translate) ->
    ctrl = @

    @hasUnitsWithoutParking = (listing) ->
      allUnitSummaries = _.concat(listing.unitSummaries.general, listing.unitSummaries.reserved)
      _.some(allUnitSummaries, 'minPriceWithoutParking')

    @hasUnitsWithParking = (listing) ->
      allUnitSummaries = _.concat(listing.unitSummaries.general, listing.unitSummaries.reserved)
      _.some(allUnitSummaries, 'minPriceWithParking')

    @hasRangeOfPricesWithoutParking = (unitSummary) ->
      unitSummary.maxPriceWithoutParking > unitSummary.minPriceWithoutParking

    @hasRangeOfPricesWithParking = (unitSummary) ->
      unitSummary.maxPriceWithParking > unitSummary.minPriceWithParking

    @hasRangeOfHoaWithoutParking = (unitSummary) ->
      unitSummary.maxHoaDuesWithoutParking > unitSummary.minHoaDuesWithoutParking

    @hasRangeOfHoaWithParking = (unitSummary) ->
      unitSummary.maxHoaDuesWithParking > unitSummary.minHoaDuesWithParking

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

    @_filterIntArrayByNull = (arr) -> arr.filter((i) -> i == 0 || !!i)

    @_getMin = (arr) ->
      filtered = @_filterIntArrayByNull(arr)
      if filtered.length then Math.min.apply(null, filtered) else null

    @_getMax = (arr) ->
      filtered = @_filterIntArrayByNull(arr)
      if filtered.length then Math.max.apply(null, filtered) else null

    @salesPriceRangeString = (unitSummary) ->
      return "" if !unitSummary
      minPrice = @_getMin([
        unitSummary.minPriceWithoutParking
        unitSummary.minPriceWithParking
      ])
      maxPrice = @_getMax([
        unitSummary.maxPriceWithoutParking
        unitSummary.maxPriceWithParking
      ])

      @_getCurrencyRange(minPrice, maxPrice)

    @hoaDuesPriceRange = (unitSummary) ->
      return "" if !unitSummary
      minHoa = @_getMin([
        unitSummary.minHoaDuesWithoutParking
        unitSummary.minHoaDuesWithParking
      ])
      maxHoa = @_getMax([
        unitSummary.maxHoaDuesWithoutParking
        unitSummary.maxHoaDuesWithParking
      ])

      @_getCurrencyRange(minHoa, maxHoa)

    return ctrl
  ]