angular.module('dahlia.components')
.component 'saleStats',
  templateUrl: 'listings/components/sale-stats.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^propertyCard'
  controller: () ->
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
      return ctrl
