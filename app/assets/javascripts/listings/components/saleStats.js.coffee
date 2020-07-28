angular.module('dahlia.components')
.component 'saleStats',
  templateUrl: 'listings/components/sale-stats.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^propertyCard'
  controller: ['$filter', '$translate', ($filter, $translate) ->
      ctrl = @
      for summary in _.concat(ctrl.listing.unitSummaries.general, ctrl.listing.unitSummaries.reserved)
        if summary
          summary['minIncome'] = 1500
          summary['maxIncome'] = 3500

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
        console.log("Getting currency range between #{min} and #{max}")
        if min && max && min < max
          $translate.instant('listings.stats.currency_range', {
            currencyMinValue: @_getCurrencyString(min)
            currencyMaxValue: @_getCurrencyString(max)
          })
        else if min
          @_getCurrencyString(min)
        else if max
          @_getCurrencyString(max)
        else
          ""

      @incomeRangeString = (unitSummary) ->
        @_getCurrencyRange(unitSummary.minIncome, unitSummary.maxIncome)

      @_filterIntArrayByNull = (arr) -> arr.filter((i) -> i == 0 || !!i)

      @_getMin = (arr) ->
        console.log('getting min', arr)
        filtered = @_filterIntArrayByNull(arr)
        console.log('filtered', filtered)
        console.log('filtered', filtered)
        if filtered.length then Math.min.apply(null, filtered) else null

      @_getMax = (arr) ->
        filtered = @_filterIntArrayByNull(arr)
        if filtered.length then Math.max.apply(null, filtered) else null

      @salesPriceRangeString = (unitSummary) ->
        minPrice = @_getMin([
          unitSummary.minPriceWithoutParking
          unitSummary.minPriceWithParking
        ])
        maxPrice = @_getMax([
          unitSummary.maxPriceWithoutParking
          unitSummary.maxPriceWithParking
        ])

        @_getCurrencyRange(minPrice, maxPrice)

      @hoaDuesSubtitleString = (unitSummary) ->
        minHoa = @_getMin([
          unitSummary.minHoaDuesWithoutParking
          unitSummary.minHoaDuesWithParking
        ])
        maxHoa = @_getMax([
          unitSummary.maxHoaDuesWithoutParking
          unitSummary.maxHoaDuesWithParking
        ])

        $translate.instant('listings.stats.hoa_dues_label', { hoaPriceValue: @_getCurrencyRange(minHoa, maxHoa) })

      return ctrl
  ]